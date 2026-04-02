import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const postalCode = String(body.postalCode || '').trim();
    const city = String(body.city || '').trim();
    const carrier = String(body.carrier || 'chronopost').toLowerCase();

    if (!postalCode) {
      return NextResponse.json({ error: 'Code postal requis' }, { status: 400 });
    }

    if (!/^\d{5}$/.test(postalCode)) {
      return NextResponse.json({ error: 'Code postal invalide' }, { status: 400 });
    }

    const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
    const secretKey = process.env.SENDCLOUD_SECRET_KEY;

    if (!publicKey || !secretKey) {
      console.error('[Sendcloud] ERREUR: SENDCLOUD_PUBLIC_KEY et/ou SENDCLOUD_SECRET_KEY non configurées');
      return NextResponse.json({
        points: [],
        error: 'Configuration Sendcloud manquante'
      });
    }

    // API Sendcloud Service Points
    const params = new URLSearchParams({
      country: 'FR',
      postal_code: postalCode,
      carrier: carrier,
      radius: '10000', // 10km en mètres
    });

    if (city) {
      params.set('city', city);
    }

    const url = `https://servicepoints.sendcloud.sc/api/v2/service-points/?${params.toString()}`;
    console.log(`[Sendcloud] Recherche relay: ${url}`);

    const auth = Buffer.from(`${publicKey}:${secretKey}`).toString('base64');

    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Sendcloud] API HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      return NextResponse.json({
        points: [],
        error: `Erreur Sendcloud (HTTP ${response.status})`
      });
    }

    const data = await response.json();
    const servicePoints = data || [];

    // Mapper au format attendu par le RelayPointSelector
    const points = servicePoints.map((sp: any) => ({
      id: String(sp.id),
      name: sp.name || '',
      address: sp.street || '',
      city: sp.city || '',
      postalCode: sp.postal_code || '',
      country: sp.country || 'FR',
      lat: sp.latitude,
      lng: sp.longitude,
      latitude: sp.latitude,
      longitude: sp.longitude,
      distance: sp.distance ?? null,
      openingHours: formatOpeningHours(sp.open_tomorrow, sp.formatted_opening_times),
      carrier: sp.carrier || carrier,
      phone: sp.phone || '',
      email: sp.email || '',
    }));

    console.log(`[Sendcloud] ${points.length} points relais trouvés pour CP=${postalCode}`);
    return NextResponse.json({ points });

  } catch (error: any) {
    console.error('[Sendcloud] Search error:', error.message || error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche de points relais', points: [] },
      { status: 500 }
    );
  }
}

function formatOpeningHours(
  openTomorrow: any,
  formattedTimes: any
): Record<string, string> {
  const days: Record<string, string> = {
    monday: '', tuesday: '', wednesday: '', thursday: '',
    friday: '', saturday: '', sunday: '',
  };

  if (formattedTimes && typeof formattedTimes === 'object') {
    const dayMap: Record<number, string> = {
      0: 'monday', 1: 'tuesday', 2: 'wednesday', 3: 'thursday',
      4: 'friday', 5: 'saturday', 6: 'sunday',
    };

    for (const [idx, dayName] of Object.entries(dayMap)) {
      const dayData = formattedTimes[idx];
      if (dayData && Array.isArray(dayData)) {
        days[dayName] = dayData.map((slot: string) => slot).join(', ');
      } else if (typeof dayData === 'string') {
        days[dayName] = dayData;
      }
    }
  }

  return days;
}
