// lib/sendcloud.ts
// Intégration Sendcloud — push données commandes
// Transporteurs : Shop2Shop (relais), Mondial Relay (relais/domicile), DPD (domicile)
//
// RÈGLE 1 (livraison classique) : push immédiat après paiement
// RÈGLE 2 (Colis Ouvert)        : NE PAS envoyer — rester en attente admin
// RÈGLE 3 (fermeture Colis Ouvert) : push lors du clic "Fermer et expédier"

const SENDCLOUD_API_URL = 'https://panel.sendcloud.sc/api/v2';
const SENDCLOUD_PUBLIC  = process.env.SENDCLOUD_PUBLIC_KEY  || '';
const SENDCLOUD_SECRET  = process.env.SENDCLOUD_SECRET_KEY  || '';

// Credentials Basic Auth Sendcloud
function getAuthHeader(): string {
  return 'Basic ' + Buffer.from(`${SENDCLOUD_PUBLIC}:${SENDCLOUD_SECRET}`).toString('base64');
}

export interface SendcloudAddress {
  name: string;
  street: string;
  house_number?: string;
  city: string;
  postal_code: string;
  country: string; // "FR"
  email?: string;
  phone?: string;
}

export interface SendcloudParcelInput {
  orderNumber: string;
  address: SendcloudAddress;
  weight: number;   // en grammes → Sendcloud attend en kg (on convertit ici)
  totalValue: number;
  shippingMethodId?: number | null; // ID méthode Sendcloud (relay = Shop2Shop/MR, home = DPD)
  relayPointId?: string | null;     // Pour les points relais
  items?: Array<{ description: string; quantity: number; value: number }>;
}

export interface SendcloudParcelResult {
  ok: boolean;
  parcelId?: number;
  trackingNumber?: string;
  error?: string;
}

/**
 * Envoie les données d'une commande à Sendcloud (création colis).
 * NE génère PAS d'étiquette — André le fait côté Sendcloud dashboard.
 */
export async function pushOrderToSendcloud(input: SendcloudParcelInput): Promise<SendcloudParcelResult> {
  if (!SENDCLOUD_PUBLIC || !SENDCLOUD_SECRET) {
    console.warn('[sendcloud] Clés API non configurées — push ignoré');
    return { ok: false, error: 'API keys not configured' };
  }

  const weightKg = Math.max(0.1, (input.weight || 300) / 1000);

  const body: Record<string, unknown> = {
    parcel: {
      name:          input.address.name,
      address:       input.address.street,
      house_number:  input.address.house_number || '',
      city:          input.address.city,
      postal_code:   input.address.postal_code,
      country:       { iso_2: input.address.country || 'FR' },
      email:         input.address.email || '',
      telephone:     input.address.phone || '',
      order_number:  input.orderNumber,
      weight:        weightKg.toFixed(3),
      total_order_value: input.totalValue?.toFixed(2),
      total_order_value_currency: 'EUR',
      request_label: false,  // André génère les étiquettes depuis son dashboard Sendcloud
    },
  };

  if (input.shippingMethodId) {
    (body.parcel as Record<string, unknown>)['shipment'] = { id: input.shippingMethodId };
  }

  if (input.relayPointId) {
    (body.parcel as Record<string, unknown>)['to_service_point'] = input.relayPointId;
  }

  if (input.items?.length) {
    (body.parcel as Record<string, unknown>)['parcel_items'] = input.items.map(i => ({
      description: i.description,
      quantity:    i.quantity,
      value:       i.value.toFixed(2),
      weight:      '0.300',
    }));
  }

  try {
    const res = await fetch(`${SENDCLOUD_API_URL}/parcels`, {
      method:  'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[sendcloud] Erreur API:', res.status, errText);
      return { ok: false, error: `API ${res.status}: ${errText.slice(0, 200)}` };
    }

    const data = await res.json() as { parcel?: { id: number; tracking_number?: string } };
    return {
      ok: true,
      parcelId:       data.parcel?.id,
      trackingNumber: data.parcel?.tracking_number,
    };
  } catch (e) {
    console.error('[sendcloud] Erreur réseau:', e);
    return { ok: false, error: String(e) };
  }
}
