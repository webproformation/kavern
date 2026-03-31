import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));
}

export async function POST(req: Request) {
  try {
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