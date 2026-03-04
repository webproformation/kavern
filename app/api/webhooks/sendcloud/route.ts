import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Sendcloud envoie des informations quand le colis bouge
    // Exemple : body.action = "parcel_status_changed"
    
    const parcel = body.parcel;
    const status = parcel?.status?.id;
    const orderNumber = parcel?.order_number;

    if (orderNumber) {
      // On met à jour le statut de la commande dans votre base de données
      // selon ce que Sendcloud nous envoie
      const { error } = await supabase
        .from('orders')
        .update({ 
          shipping_status: status,
          tracking_number: parcel.tracking_number,
          tracking_url: parcel.tracking_url 
        })
        .eq('order_number', orderNumber);

      if (error) console.error('Erreur mise à jour commande via Sendcloud:', error);
    }

    // On répond toujours "200 OK" à Sendcloud pour confirmer la réception
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Erreur Webhook Sendcloud:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }
}

// Optionnel : Gérer le GET pour les tests de Sendcloud
export async function GET() {
  return NextResponse.json({ message: "Sendcloud Webhook Endpoint is active" });
}