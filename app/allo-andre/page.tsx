import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MessageCircle, HelpCircle, Package, Shirt, PhoneCall, Sparkles, Search } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function AlloMorganePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F2F2E8]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* EN-TÊTE */}
          <PageHeader
            icon={PhoneCall}
            title="ALLO ANDRÉ ?"
            description="Ici, pas de robot. C'est le patron qui répond !"
          />

          {/* INTRO */}
          <Card className="bg-white shadow-md">
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-xl font-semibold text-[#C6A15B]">Bienvenue sur ma ligne directe.</p>
              <p className="text-lg leading-relaxed text-gray-700">
                Vous avez une question sur une bougie ? Un doute sur la taille d'un vêtement de seconde main ? 
                Ou vous cherchez un produit introuvable ?
              </p>
              <p className="text-lg leading-relaxed text-gray-700 font-medium">
                Ne restez pas avec votre interrogation. Dans la Kavern, on aime discuter.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Voici comment je peux vous aider aujourd'hui :</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* 1. LE CONSEIL NEZ */}
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#C6A15B] p-2 rounded-full">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">1. Le Conseil "Nez" (Mes Bougies)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium text-gray-800">Vous hésitez entre "Dimanche Matin" et "Rêve Éveillé" ?</p>
                  <p className="text-gray-600">
                    Dites-moi ce que vous aimez d'habitude (fruité, boisé, sucré, frais...), et je vous guiderai vers la création 
                    qui parfumera le mieux votre intérieur. Je connais mes cires par cœur !
                  </p>
                </CardContent>
              </Card>

              {/* 2. LE CONSEIL MODE */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-full">
                      <Shirt className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">2. Le Conseil "Mode & Mesures"</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium text-gray-800">La seconde main, c'est unique.</p>
                  <p className="text-gray-600">
                    Parfois, un "M" vintage taille comme un "S" d'aujourd'hui. Si vous avez un doute sur une pépite du Dressing, 
                    envoyez-moi un message : je sors mon mètre ruban et je vous donne les dimensions exactes (épaules, longueur, taille) 
                    avant que vous ne commandiez.
                  </p>
                </CardContent>
              </Card>

              {/* 3. LE CHASSEUR DE TRESORS */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 p-2 rounded-full">
                      <Search className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">3. Le Chasseur de Trésors</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium text-gray-800">Vous cherchez quelque chose de précis introuvable sur le site ?</p>
                  <p className="text-gray-600 italic">"André, tu n'aurais pas de la lessive Ariel en promo ?"</p>
                  <p className="text-gray-600 italic">"Je cherche une veste en jean Levi's taille L..."</p>
                  <p className="text-gray-600 mt-2">
                    Dites-le-moi ! Lors de mes prochains arrivages ou mes tournées chez mes fournisseurs, j'ouvrirai l'œil pour vous.
                  </p>
                </CardContent>
              </Card>

              {/* 4. SOUCI COMMANDE */}
              <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-100">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500 p-2 rounded-full">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">4. Un souci avec une commande ?</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium text-gray-800">Un colis arrivé un peu secoué ? Une erreur de ma part ?</p>
                  <p className="text-gray-600">
                    (ça arrive, je suis humain) Pas de panique. Envoyez-moi une photo et votre numéro de commande. 
                    On va régler ça ensemble, rapidement et avec le sourire.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Comment nous joindre ?</h2>

            <div className="grid gap-6">
              
              {/* EMAIL */}
              <Card className="border-[#C6A15B] border-2 bg-gradient-to-br from-[#D4AF37]/10 to-[#b8933d]/10">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#C6A15B] p-3 rounded-full">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>Par Email</CardTitle>
                      <p className="text-sm text-gray-600">Réponse sous 24h ouvrées</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <a href="mailto:contact@kavern-france.fr" className="text-[#C6A15B] text-lg font-semibold hover:underline">
                    contact@kavern-france.fr
                  </a>
                  <p className="text-sm text-gray-600 mt-2">
                    L'idéal pour les questions détaillées ou les photos à envoyer.
                  </p>
                </CardContent>
              </Card>

              {/* FACEBOOK */}
              <Card className="border-blue-300 border-2 bg-blue-50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-3 rounded-full">
                      <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div>
                      <CardTitle>Sur Facebook</CardTitle>
                      <p className="text-sm text-gray-600">Messagerie instantanée</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <a href="https://www.facebook.com/kavern.france" target="_blank" rel="noopener noreferrer" className="text-blue-600 text-lg font-semibold hover:underline">
                    KAVERN
                  </a>
                  <p className="text-sm text-gray-600 mt-2">
                    Envoyez-nous un message privé, on répond rapidement !
                  </p>
                </CardContent>
              </Card>

              {/* TELEPHONE */}
              <Card className="border-green-300 border-2 bg-green-50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>Par Téléphone / WhatsApp</CardTitle>
                      <p className="text-sm text-gray-600">Du lundi au vendredi, 10h-18h</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900">André</p>
                    <a href="tel:+33603489662" className="text-green-600 text-lg font-semibold hover:underline">
                      +33 6 03 48 96 62
                    </a>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    WhatsApp disponible.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-[#C6A15B] to-[#b8933d] text-white">
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-xl leading-relaxed font-semibold">
                N'hésitez pas, aucune question n'est bête.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}