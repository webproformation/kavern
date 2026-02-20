'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Phone, MessageCircle, HelpCircle, Package, Shirt, PhoneCall, Sparkles, Search, HeartHandshake, Utensils } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function AlloAndrePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F2F2E8]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* EN-TÊTE */}
          <PageHeader
            icon={PhoneCall}
            title="ALLO ANDRÉ ?"
            description="Votre service client 100 % humain"
          />

          {/* INTRO */}
          <Card className="bg-white shadow-md border-none">
            <CardContent className="p-8 space-y-6">
              <p className="text-lg leading-relaxed text-gray-700">
                Chez <span className="font-bold text-[#C6A15B]">KAVERN</span>, vous n'êtes pas un simple numéro de commande, et vous ne parlerez jamais à un robot. 
                Parce que notre Concept Store est avant tout une aventure humaine et conviviale, nous avons mis en place un service client qui vous ressemble : 
                <span className="font-semibold"> direct, chaleureux et toujours à l'écoute.</span>
              </p>
              <p className="text-lg leading-relaxed text-gray-700">
                Un doute sur un produit ? Une question sur le fonctionnement de votre <span className="font-semibold text-[#C6A15B]">Colis Ouvert</span> ? 
                Un petit souci avec une livraison ? Allo André est là pour vous.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Pourquoi contacter André ?</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* 1. GÉRER LE COLIS OUVERT */}
              <Card className="bg-white border-amber-100 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="bg-[#C6A15B] p-3 rounded-full">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Gérer votre Colis Ouvert</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-center text-sm text-gray-600">
                  <p>
                    Vous voulez être sûre que votre dernière trouvaille du Live a bien été ajoutée à votre malle ? 
                    Vous souhaitez déclencher votre expédition ? Je m'en occupe !
                  </p>
                </CardContent>
              </Card>

              {/* 2. CONSEIL SUR-MESURE */}
              <Card className="bg-white border-amber-100 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="bg-[#C6A15B] p-3 rounded-full">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Conseil sur-mesure</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-center text-sm text-gray-600">
                  <p>
                    Besoin d'aide pour choisir le parfum parfait de votre prochaine bougie artisanale, 
                    ou pour trouver la meilleure terrine pour un apéro réussi ? Demandez-moi conseil !
                  </p>
                </CardContent>
              </Card>

              {/* 3. SAV */}
              <Card className="bg-white border-amber-100 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="bg-[#C6A15B] p-3 rounded-full">
                      <HeartHandshake className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Service Après-Vente</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-center text-sm text-gray-600">
                  <p>
                    L'inattendu arrive. Si un produit est arrivé abîmé ou qu'il y a la moindre erreur, 
                    on ne se cache pas : on trouve une solution immédiate ensemble.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Comment me joindre facilement ?</h2>
            <p className="text-center text-gray-600">Choisissez le canal que vous préférez, je vous réponds personnellement et le plus rapidement possible :</p>

            <div className="grid md:grid-cols-3 gap-6">
              
              {/* EMAIL */}
              <Card className="border-t-4 border-t-[#C6A15B] bg-white shadow-sm">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="bg-[#C6A15B]/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="h-6 w-6 text-[#C6A15B]" />
                  </div>
                  <CardTitle className="text-base">Par Email</CardTitle>
                  <a href="mailto:contact@kavern-france.fr" className="block text-[#C6A15B] font-semibold hover:underline break-all">
                    contact@kavern-france.fr
                  </a>
                </CardContent>
              </Card>

              {/* FACEBOOK */}
              <Card className="border-t-4 border-t-blue-600 bg-white shadow-sm">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="bg-blue-600/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <CardTitle className="text-base">Sur Facebook</CardTitle>
                  <a href="https://www.facebook.com/kavern.france" target="_blank" rel="noopener noreferrer" className="block text-blue-600 font-semibold hover:underline">
                    Page KAVERN
                  </a>
                </CardContent>
              </Card>

              {/* WHATSAPP */}
              <Card className="border-t-4 border-t-green-600 bg-white shadow-sm">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="bg-green-600/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-base">WhatsApp / Tél</CardTitle>
                  <a href="tel:+33603489662" className="block text-green-600 font-semibold hover:underline">
                    06 03 48 96 62
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CITATION FINALE */}
          <Card className="bg-gradient-to-br from-[#C6A15B] to-[#b8933d] text-white overflow-hidden relative">
            <CardContent className="p-10 text-center relative z-10">
              <p className="text-xl italic leading-relaxed font-medium">
                "L'artisanat et l'inattendu, c'est aussi dans notre façon de prendre soin de vous. Faites vos trouvailles l'esprit léger, je m'occupe du reste !"
              </p>
              <p className="mt-4 font-bold text-lg uppercase tracking-wider">— André</p>
            </CardContent>
            <Sparkles className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10 rotate-12" />
          </Card>
        </div>
      </div>
    </div>
  );
}