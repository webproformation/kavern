// app/api/sendcloud/push/route.ts
// RÈGLE 1 : push commande normale vers Sendcloud (immédiat après paiement)
// RÈGLE 3 : push colis ouvert consolidé vers Sendcloud (à la fermeture)

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { pushOrderToSendcloud } from '@/lib/sendcloud';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json() as { orderId?: string; openPackageId?: string };

    // ─── RÈGLE 1 : commande normale ────────────────────────────────────────────
    if (body.orderId) {
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', body.orderId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

      // Sécurité : ne jamais pousser un colis ouvert ici (RÈGLE 2)
      if (order.is_open_package || order.shipping_type === 'open_package') {
        return NextResponse.json({ skipped: true, reason: 'open_package_rule2' });
      }

      const addr = order.shipping_address as Record<string, string> | null;
      if (!addr) return NextResponse.json({ skipped: true, reason: 'no_address' });

      const result = await pushOrderToSendcloud({
        orderNumber:      order.order_number,
        weight:           order.total_virtual_weight || 500,
        totalValue:       parseFloat(order.total) || 0,
        shippingMethodId: order.relay_point_data?.sendcloud_method_id || null,
        relayPointId:     order.relay_point_data?.id || null,
        address: {
          name:        `${addr.first_name || ''} ${addr.last_name || ''}`.trim(),
          street:      addr.address_line1 || order.shipping_street || '',
          city:        addr.city || '',
          postal_code: addr.postal_code || '',
          country:     addr.country || 'FR',
          email:       addr.email || '',
          phone:       addr.phone || order.shipping_phone || '',
        },
        items: (order.order_items || []).map((i: Record<string, unknown>) => ({
          description: String(i.product_name || 'Article'),
          quantity:    Number(i.quantity) || 1,
          value:       parseFloat(String(i.price)) || 0,
        })),
      });

      // Enregistrer le résultat dans la commande
      if (result.ok && result.parcelId) {
        await supabaseAdmin.from('orders').update({
          sendcloud_parcel_id: result.parcelId,
          tracking_number: result.trackingNumber || null,
        }).eq('id', body.orderId);
      }

      return NextResponse.json({ ok: result.ok, parcelId: result.parcelId, error: result.error });
    }

    // ─── RÈGLE 3 : fermeture Colis Ouvert → push consolidé ────────────────────
    if (body.openPackageId) {
      const { data: pkg } = await supabaseAdmin
        .from('open_packages')
        .select('*, open_package_orders(order_id)')
        .eq('id', body.openPackageId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

      // Récupérer toutes les commandes du colis
      const orderIds = (pkg.open_package_orders || []).map((o: Record<string, string>) => o.order_id);
      const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*)')
        .in('id', orderIds);

      // Consolider les articles
      const allItems: Array<{ description: string; quantity: number; value: number }> = [];
      let totalValue = 0;
      (orders || []).forEach((o: Record<string, unknown>) => {
        totalValue += parseFloat(String(o.total)) || 0;
        const items = o.order_items as Array<Record<string, unknown>>;
        (items || []).forEach(i => {
          allItems.push({
            description: String(i.product_name || 'Article'),
            quantity:    Number(i.quantity) || 1,
            value:       parseFloat(String(i.price)) || 0,
          });
        });
      });

      // Adresse de livraison depuis le colis ouvert
      const { data: shippingAddr } = pkg.shipping_address_id
        ? await supabaseAdmin.from('addresses').select('*').eq('id', pkg.shipping_address_id).maybeSingle()
        : { data: null };

      if (!shippingAddr) return NextResponse.json({ error: 'No shipping address on open package' }, { status: 400 });

      const firstOrder = (orders || [])[0] as Record<string, unknown>;
      const result = await pushOrderToSendcloud({
        orderNumber:      `CO-${pkg.id.slice(0, 8)}`,
        weight:           pkg.total_weight_grams || (orderIds.length * 500),
        totalValue,
        shippingMethodId: null,
        relayPointId:     pkg.relay_point_id || null,
        address: {
          name:        `${shippingAddr.first_name || ''} ${shippingAddr.last_name || ''}`.trim(),
          street:      shippingAddr.address_line1 || '',
          city:        shippingAddr.city || '',
          postal_code: shippingAddr.postal_code || '',
          country:     shippingAddr.country || 'FR',
          email:       String(firstOrder?.shipping_address?.email || ''),
          phone:       shippingAddr.phone || '',
        },
        items: allItems,
      });

      if (result.ok && result.parcelId) {
        await supabaseAdmin.from('open_packages').update({
          sendcloud_parcel_id: result.parcelId,
          tracking_number: result.trackingNumber || null,
          status: 'shipped',
        }).eq('id', body.openPackageId);
      }

      return NextResponse.json({ ok: result.ok, parcelId: result.parcelId, error: result.error });
    }

    return NextResponse.json({ error: 'orderId ou openPackageId requis' }, { status: 400 });
  } catch (e) {
    console.error('[sendcloud/push]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
