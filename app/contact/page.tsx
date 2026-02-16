'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GDPRConsent } from '@/components/gdpr-consent';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

export default function ContactPage() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    gdprConsent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (profile) {
      const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      setFormData(prev => ({
        ...prev,
        name: fullName || prev.name,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
      }));
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.gdprConsent) {
      toast.error('Veuillez accepter la politique de confidentialité');
      return;
    }

    setSubmitting(true);

    try {
      // 1. ENREGISTREMENT DANS SUPABASE
      const { error: supabaseError } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject,
          message: formData.message,
        });

      if (supabaseError) throw supabaseError;

      // 2. ENVOI DE L'EMAIL VIA L'API SMTP
      const emailRes = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!emailRes.ok) throw new Error("Erreur lors de l'envoi de l'email");

      setSubmitted(true);
      toast.success('Message envoyé avec succès !');

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        gdprConsent: false,
      });

      setTimeout(() => setSubmitted(false), 5000);
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F2F2E8] flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Message envoyé !</h2>
            <p className="text-gray-700">
              Merci pour votre message. Nous vous répondrons dans les plus brefs délais sur votre boîte mail.
            </p>
            <Button onClick={() => setSubmitted(false)} className="bg-[#C6A15B] hover:bg-[#b8933d]">
              Envoyer un autre message
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F2F2E8]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            icon={MessageSquare}
            title="Contactez-nous"
            description="Une question, un conseil, une demande particulière ? Nous sommes là pour vous répondre."
          />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Envoyez-nous un message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Votre nom complet"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="votre@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Sujet *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        placeholder="Objet de votre message"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={6}
                        placeholder="Écrivez votre message ici..."
                      />
                    </div>

                    <div className="space-y-4">
                      <GDPRConsent
                        type="contact"
                        checked={formData.gdprConsent}
                        onCheckedChange={(checked) => setFormData({ ...formData, gdprConsent: checked })}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#C6A15B] hover:bg-[#b8933d] gap-2"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Nos coordonnées</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-[#C6A15B] mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">Adresse</p>
                        <p className="text-gray-700 text-sm">
                          1062 rue d'Armentières<br/>
                          59850 Nieppe<br/>
                          France
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-[#C6A15B] mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">Téléphone</p>
                        <div className="text-sm">
                          <p className="text-gray-600">André :</p>
                          <a href="tel:+33603489662" className="text-[#C6A15B] font-semibold hover:underline">
                            +33 6 03 48 96 62
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-[#C6A15B] mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">Email</p>
                        <a href="mailto:contact@kavern-france.fr" className="text-[#C6A15B] hover:underline text-sm font-semibold">
                          contact@kavern-france.fr
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-[#C6A15B] mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">Horaires</p>
                        <div className="text-sm text-gray-700 space-y-2">
                          <p>
                            <strong>En boutique sur rendez-vous :</strong><br/>
                            Le mercredi de 9h à 19h
                          </p>
                          <p>
                            <strong>Par téléphone :</strong><br/>
                            Du lundi au vendredi de 9h à 18h
                          </p>
                          <p className="text-xs text-gray-600 italic leading-relaxed">
                            En dehors de ces horaires, laissez-nous un SMS ou un e-mail, nous vous répondrons rapidement.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}