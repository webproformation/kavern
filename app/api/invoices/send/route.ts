import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { invoiceId } = await req.json();

    // 1. VÉRIFICATION CLÉ
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: "ERREUR CONFIG : Clé SUPABASE_SERVICE_ROLE_KEY manquante." }, { status: 500 });
    }

    // 2. ADMIN CLIENT
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    // AUTH CHECK : vérifier que l'appelant est admin
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        const { data: profile } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
        if (!profile?.is_admin) {
          return NextResponse.json({ error: 'Accès interdit — Admin uniquement' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 3. RÉCUPÉRATION
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('*, orders:order_id ( * )') 
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error("Erreur DB:", invoiceError);
      return NextResponse.json({ error: `Erreur récupération facture: ${invoiceError?.message}` }, { status: 404 });
    }

    // 4. RECHERCHE INTELLIGENTE EMAIL
    let clientEmail = invoice.orders?.email || invoice.orders?.guest_email || invoice.orders?.contact_email;

    if (!clientEmail && invoice.orders?.user_id) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('id', invoice.orders.user_id)
        .single();
      clientEmail = profile?.email;
    }

    if (!clientEmail) {
      if (invoice.orders?.shipping_address?.email) {
         clientEmail = invoice.orders.shipping_address.email;
      } else {
         return NextResponse.json({ error: "Aucun email trouvé pour ce client." }, { status: 400 });
      }
    }

    // 5. CONFIG SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false }
    });

    // 6. DESIGN DU MAIL
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .banner { width: 100%; display: block; background-color: #000; }
          .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
          .h1 { color: #000000; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .yellow-box { 
            background-color: #fffbf0; 
            border-left: 5px solid #D4AF37; 
            padding: 20px; 
            margin: 30px 0; 
          }
          .box-title { color: #000; font-weight: bold; text-transform: uppercase; font-size: 14px; margin-bottom: 15px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
          .label { color: #666; }
          .value { font-weight: bold; color: #000; }
          .total-row { border-top: 1px solid #eee; margin-top: 10px; padding-top: 10px; font-size: 18px; color: #D4AF37; font-weight: bold; }
          
          .btn { display: inline-block; background-color: #D4AF37; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; text-align: center; }
          
          .contact-section { background-color: #ffffff; padding: 30px; border-top: 1px solid #eee; }
          .contact-title { font-weight: bold; font-size: 16px; margin-bottom: 20px; }
          .contact-item { margin-bottom: 10px; font-size: 14px; color: #444; }
          .contact-icon { color: #D4AF37; margin-right: 10px; }
          .contact-link { color: #D4AF37; text-decoration: none; font-weight: bold; }
          
          .footer { background-color: #222222; color: #999999; padding: 30px 20px; text-align: center; font-size: 12px; line-height: 1.6; }
          .footer-title { color: #ffffff; font-weight: bold; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="https://kavern.fr/kavern-logo.png" alt="KAVERN" class="banner" style="max-height: 150px; object-fit: contain; background: black;">
          
          <div class="content">
            <h1 class="h1">Bonjour ${invoice.customer_name} 👋</h1>
            
            <p>Nous espérons que vous allez bien !</p>
            <p>Veuillez trouver ci-joint la facture correspondant à votre commande récente.</p>
            
            <div class="yellow-box">
              <div class="box-title">Votre Facture</div>
              
              <div class="row">
                <span class="label">Date d'émission :</span>
                <span class="value">${new Date().toLocaleDateString('fr-FR')}</span>
              </div>
              <div class="row">
                <span class="label">Numéro :</span>
                <span class="value">${invoice.invoice_number}</span>
              </div>
              
              <div class="row total-row" style="justify-content: space-between; display: flex;">
                <span>Montant total :</span>
                <span>${parseFloat(invoice.amount).toFixed(2)} €</span>
              </div>
            </div>

            <p style="text-align: center;">
              Vous pouvez télécharger votre facture PDF en cliquant sur le bouton ci-dessous :
            </p>
            
            <div style="text-align: center;">
              <a href="${invoice.pdf_url}" class="btn">Télécharger ma facture</a>
            </div>
          </div>

          <div class="contact-section">
            <div class="contact-title">Une question ? Nous sommes là pour vous aider !</div>
            <div class="contact-item">
              ✉️ Email : <a href="mailto:contact@kavern.fr" class="contact-link">contact@kavern.fr</a>
            </div>
            <div class="contact-item">
              📞 André : +33 6 03 48 96 62
            </div>
            <div class="contact-item">
              📞 André : +33 6 03 48 96 62
            </div>
          </div>

          <div class="footer">
            <div class="footer-title">KAVERN - SAS au capital de 1 000 €</div>
            <div>1062 Rue d'Armentières, 59850 Nieppe, France</div>
            <div style="margin-top: 10px;">
              RCS Dunkerque 102 355 443 | SIRET : 102 355 443 00015<br>
              TVA : FR37102355443 | APE : 4791A
            </div>
            <div style="margin-top: 15px; font-style: italic;">
              kavern-france.fr
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // 7. ENVOI
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"KAVERN" <contact@kavern.fr>',
      to: clientEmail,
      subject: `Votre facture ${invoice.invoice_number} est disponible`,
      html: emailHtml,
      attachments: [
        {
          filename: `${invoice.invoice_number}.pdf`,
          path: invoice.pdf_url
        }
      ]
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: "Erreur technique : " + error.message }, { status: 500 });
  }
}