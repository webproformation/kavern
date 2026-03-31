import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Rate limiting simple en mémoire (reset au redéploiement)
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5; // max 5 requêtes
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // par heure

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));
}

export async function POST(req: Request) {
  try {
    // Rate limiting par IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const entry = rateLimit.get(ip);
    if (entry && now < entry.resetAt) {
      entry.count++;
      if (entry.count > RATE_LIMIT_MAX) {
        return NextResponse.json({ error: 'Trop de messages envoyés. Réessayez plus tard.' }, { status: 429 });
      }
    } else {
      rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    }

    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Nom, email et message sont requis' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true, // true pour le port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: 'contact@kavern-france.fr',
      replyTo: email,
      subject: `[Formulaire Contact] ${subject}`,
      text: `Nouveau message de : ${name}\nEmail : ${email}\nTéléphone : ${phone || 'Non renseigné'}\n\nMessage :\n${message}`,
      html: `
        <h3>Nouveau message de contact</h3>
        <p><strong>Nom :</strong> ${escapeHtml(name || '')}</p>
        <p><strong>Email :</strong> ${escapeHtml(email || '')}</p>
        <p><strong>Téléphone :</strong> ${escapeHtml(phone || 'Non renseigné')}</p>
        <p><strong>Sujet :</strong> ${escapeHtml(subject || '')}</p>
        <p><strong>Message :</strong></p>
        <p style="white-space: pre-wrap;">${escapeHtml(message || '')}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email envoyé avec succès' }, { status: 200 });
  } catch (error) {
    console.error('SMTP Error:', error);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
  }
}