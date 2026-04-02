import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Sanitize XML: strip dangerous characters
    const sanitize = (s: string) => String(s).replace(/[<>&"']/g, '').trim();
    const postalCode = sanitize(body.postalCode || '');
    const city = sanitize(body.city || '');

    if (!postalCode) {
      return NextResponse.json(
        { error: 'Code postal requis' },
        { status: 400 }
      );
    }

    if (!/^\d{5}$/.test(postalCode)) {
      return NextResponse.json({ error: 'Code postal invalide' }, { status: 400 });
    }

    const chronopostAccount = process.env.CHRONOPOST_ACCOUNT_NUMBER;
    const chronopostPassword = process.env.CHRONOPOST_PASSWORD;

    if (!chronopostAccount || !chronopostPassword) {
      console.error('[Chronopost] ERREUR: Variables CHRONOPOST_ACCOUNT_NUMBER et/ou CHRONOPOST_PASSWORD non configurées dans les variables d\'environnement Vercel');
      return NextResponse.json({
        points: [],
        error: 'Configuration Chronopost manquante — vérifiez les variables d\'environnement'
      });
    }

    console.log(`[Chronopost] Recherche relay: CP=${postalCode}, ville=${city || '(non renseignée)'}, compte=${chronopostAccount.substring(0, 4)}***`);

    const response = await fetch('https://ws.chronopost.fr/recherchebt-ws-cxf/PointRelaisServiceWS?wsdl', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://cxf.recherchepointrelais.webservice.chronopost.fr/recherchePointRelais'
      },
      body: `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:cxf="http://cxf.recherchepointrelais.webservice.chronopost.fr/">
  <soapenv:Header/>
  <soapenv:Body>
    <cxf:recherchePointRelais>
      <accountNumber>${chronopostAccount}</accountNumber>
      <password>${chronopostPassword}</password>
      <zipCode>${postalCode}</zipCode>
      <city>${city}</city>
      <countryCode>FR</countryCode>
      <type>P</type>
      <maxPointChronopost>10</maxPointChronopost>
      <maxDistanceSearch>50</maxDistanceSearch>
    </cxf:recherchePointRelais>
  </soapenv:Body>
</soapenv:Envelope>`
    });

    if (!response.ok) {
      console.error(`[Chronopost] API HTTP ${response.status}: ${response.statusText}`);
      throw new Error(`Erreur API Chronopost (HTTP ${response.status})`);
    }

    const xmlData = await response.text();

    // Vérifier les codes d'erreur Chronopost dans la réponse SOAP
    const errorCodeMatch = xmlData.match(/<errorCode>(\d+)<\/errorCode>/);
    const errorMessageMatch = xmlData.match(/<errorMessage>(.*?)<\/errorMessage>/);
    if (errorCodeMatch && errorCodeMatch[1] !== '0') {
      console.error(`[Chronopost] Erreur API code=${errorCodeMatch[1]}, message=${errorMessageMatch?.[1] || 'inconnu'}`);
      return NextResponse.json({
        points: [],
        error: `Erreur Chronopost: ${errorMessageMatch?.[1] || 'Code ' + errorCodeMatch[1]}`
      });
    }

    const points = parseChronopostResponse(xmlData);
    console.log(`[Chronopost] ${points.length} points relais trouvés pour CP=${postalCode}`);

    return NextResponse.json({ points });

  } catch (error: any) {
    console.error('Chronopost search error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche Chronopost', points: [] },
      { status: 500 }
    );
  }
}

function parseChronopostResponse(xml: string): any[] {
  const points: any[] = [];

  // Extraire chaque bloc <listePointRelais>
  const blockRegex = /<listePointRelais>([\s\S]*?)<\/listePointRelais>/g;
  let match;

  while ((match = blockRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}>(.*?)</${tag}>`));
      return m ? m[1].trim() : '';
    };

    const lat = parseFloat(get('coordGeolocalisationLatitude'));
    const lng = parseFloat(get('coordGeolocalisationLongitude'));

    if (isNaN(lat) || isNaN(lng)) continue;

    points.push({
      id: get('identifiantChronopostPointA2PAS'),
      name: get('nomEnseigne'),
      address: get('adresse1'),
      city: get('localite'),
      postalCode: get('codePostal'),
      country: 'FR',
      lat,
      lng,
      distance: get('distanceEnMetre') ? parseInt(get('distanceEnMetre')) : null,
      openingHours: {
        monday: `${get('horairesOuvertureLundi')} - ${get('horairesFermetureLundi')}`,
        tuesday: `${get('horairesOuvertureMardi')} - ${get('horairesFermetureMardi')}`,
        wednesday: `${get('horairesOuvertureMercredi')} - ${get('horairesFermetureMercredi')}`,
        thursday: `${get('horairesOuvertureJeudi')} - ${get('horairesFermetureJeudi')}`,
        friday: `${get('horairesOuvertureVendredi')} - ${get('horairesFermetureVendredi')}`,
        saturday: `${get('horairesOuvertureSamedi')} - ${get('horairesFermetureSamedi')}`,
        sunday: `${get('horairesOuvertureDimanche')} - ${get('horairesFermetureDimanche')}`,
      },
    });
  }

  return points;
}
