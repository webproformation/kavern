'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Truck, 
  Package, 
  Clock, 
  Gift, 
  MapPin, 
  ShieldCheck, 
  Search, 
  AlertCircle,
  Zap
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';

export default function ViteChezVousPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F2F2E8]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* EN-TÊTE */}
          <PageHeader
            icon={Truck}
            title="Vite chez vous"
            description="Une expédition rapide et soignée"
          />

          {/* INTRODUCTION */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">
              Chez <span className="font-bold text-[#C6A15B]">KAVERN</span>, nous savons que l&apos;attente est le moment le plus difficile 
              une fois que vous avez déniché vos pépites ! C&apos;est pourquoi nous mettons un point d&apos;honneur à préparer et expédier 
              vos trouvailles avec la plus grande réactivité et un soin tout particulier.
            </p>
            <p className="text-gray-600 italic">
              Que vous fassiez un achat classique ou que vous clôturiez votre &quot;Colis Ouvert&quot;, voici comment votre trésor voyage jusqu&apos;à vous :
            </p>
          </div>

          {/* SECTION 1 : EXPÉDITION RAPIDE */}
          <Card className="border-l-4 border-l-[#C6A15B] bg-white shadow-sm overflow-hidden">
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="bg-[#C6A15B]/10 p-4 rounded-full">
                <Zap className="h-10 w-10 text-[#C6A15B]" />
              </div>
              <div className="space-y-3 flex-1">
                <h2 className="text-2xl font-bold text-gray-900">Le Top Départ : Expédition en 24h à 48h</h2>
                <p className="text-gray-700 leading-relaxed">
                  Dès que votre commande classique est validée, ou dès que vous cliquez sur <strong>&quot;Fermer mon Colis Ouvert&quot;</strong>, André passe à l&apos;action.
                  Votre carton est préparé avec soin dans notre atelier et remis au transporteur dans un délai de <strong>24 à 48 heures ouvrées</strong>. 
                  Fini les attentes interminables, on ne rigole pas avec vos coups de cœur !
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2 : EMBALLAGE ANTI-CASSE */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white shadow-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ShieldCheck className="h-6 w-6 text-[#C6A15B]" />
                  Un emballage &quot;Anti-Casse&quot;
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  L&apos;Artisanat et l&apos;inattendu, ça se protège ! Parce que votre colis contient des produits précieux 
                  (bougies artisanales, épicerie fine en bocal, accessoires beauté...), nous accordons une attention extrême à l&apos;emballage.
                </p>
                <div className="bg-gray-50 p-4 rounded-xl text-sm">
                  <strong>Protection maximale :</strong> Calage soigné, papier bulle ou kraft pour que vos créations voyagent en toute sécurité.
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#D4AF37] to-[#b8933d] text-white h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Gift className="h-6 w-6" />
                  L&apos;effet &quot;Cadeau&quot;
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg leading-relaxed">
                  Ouvrir un colis KAVERN doit être une fête. Chaque commande est emballée comme un présent, 
                  avec la délicatesse que vos trouvailles méritent.
                </p>
                <p className="italic font-medium">Préparez-vous à une belle expérience de déballage !</p>
              </CardContent>
            </Card>
          </div>

          {/* SECTION 3 : TRANSPORTEURS */}
          <div className="space-y-6 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Nos Transporteurs Partenaires : Le choix vous appartient</h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto">
              Pour vous offrir la meilleure expérience entre économie, flexibilité et rapidité, nous avons sélectionné trois partenaires de confiance :
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* MONDIAL RELAY */}
              <Card className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-full h-12 flex items-center justify-center grayscale hover:grayscale-0 transition-all">
                    <MapPin className="h-8 w-8 text-[#C6A15B]" />
                    <span className="font-bold ml-2">Mondial Relay</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Livraison en point relais. Idéal pour récupérer votre colis à votre rythme, près de chez vous ou du travail.
                  </p>
                </CardContent>
              </Card>

              {/* CHRONOPOST */}
              <Card className="bg-white hover:shadow-md transition-shadow border-t-4 border-t-[#C6A15B]">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-full h-12 flex items-center justify-center grayscale hover:grayscale-0 transition-all">
                    <Zap className="h-8 w-8 text-[#C6A15B]" />
                    <span className="font-bold ml-2">Chronopost Relais</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    La solution ultra-rapide. Pour les plus pressé(e)s de découvrir leurs nouveautés en point relais.
                  </p>
                </CardContent>
              </Card>

              {/* GLS */}
              <Card className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-full h-12 flex items-center justify-center grayscale hover:grayscale-0 transition-all">
                    <Truck className="h-8 w-8 text-[#C6A15B]" />
                    <span className="font-bold ml-2">GLS</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Livraison à domicile ou en point relais. Parfait pour les gros colis ou pour le confort absolu.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* SECTION 4 : SUIVI ET SAV */}
          <div className="grid md:grid-cols-2 gap-6 pt-6">
            <Card className="bg-blue-50 border-none shadow-none">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  Où est mon trésor ?
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Dès que votre colis quitte notre atelier, vous recevez un email automatique avec votre 
                  <strong> numéro de suivi</strong>. Vous pouvez ainsi suivre le voyage de vos nouveautés étape par étape.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-none shadow-none">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Un problème de livraison ?
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Vous n&apos;êtes jamais seul(e) ! En cas de retard ou d&apos;article endommagé, contactez le service client 
                  <Link href="/allo-andre" className="text-[#C6A15B] font-bold hover:underline mx-1">
                    Allo André
                  </Link>. 
                  Je m&apos;occupe de trouver une solution avec le transporteur immédiatement.
                </p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}