'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingBag, 
  Truck, 
  HelpCircle, 
  Sparkles,
  Lock,
  MessageCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

export default function ColisOuvertInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F2F2E8]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* EN-TÊTE */}
          <PageHeader
            icon={Package}
            title="Le Colis Ouvert"
            description="Votre Malle aux Trésors"
          />

          {/* INTRODUCTION */}
          <Card className="bg-white shadow-md border-none overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <p className="text-lg leading-relaxed text-gray-700">
                C&apos;est l&apos;atout numéro 1 de <span className="font-bold text-[#C6A15B]">KAVERN</span> ! 
                Vous avez un coup de cœur pour une bougie artisanale le samedi, et vous craquez pour des biscuits artisanaux lors de notre Live du lundi ? 
                <span className="font-semibold text-gray-900"> Ne payez pas deux fois les frais de port !</span>
              </p>
              <p className="text-lg leading-relaxed text-gray-700">
                Avec le système du Colis Ouvert, vous mettez vos trouvailles de côté, vous les cumulez au fil de l&apos;eau, 
                et vous ne réglez l&apos;expédition qu&apos;une seule fois, quand vous l&apos;avez décidé.
              </p>
            </CardContent>
          </Card>

          {/* ÉTAPES */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[#C6A15B]" />
              Comment ça marche ? (En 4 étapes simples)
            </h2>
            
            <div className="grid gap-4">
              {[
                {
                  step: "1",
                  title: "Je craque (En Live ou sur le site)",
                  desc: "Vous avez repéré une pépite ? Ajoutez-la normalement à votre panier sur le site."
                },
                {
                  step: "2",
                  title: "Je mets de côté (L'option magique)",
                  desc: "Au moment de valider votre panier et de choisir la livraison, sélectionnez l'option \"Ajouter à mon Colis Ouvert\". Vous réglez uniquement vos articles du jour, avec 0 € de frais de port. Vos produits sont désormais réservés et stockés bien au chaud dans notre atelier !"
                },
                {
                  step: "3",
                  title: "Je cumule à mon rythme",
                  desc: "Revenez le lendemain, au prochain Live, ou la semaine suivante. Recommencez l'opération autant de fois que vous le souhaitez. Nous ajouterons vos nouveaux coups de cœur dans votre carton."
                },
                {
                  step: "4",
                  title: "Je ferme et j'expédie !",
                  desc: "Votre malle aux trésors est pleine ? Il vous suffit de vous rendre dans la rubrique \"Fermer mon Colis Ouvert\" (ou de sélectionner l'expédition classique lors de votre ultime achat). Vous réglez une seule fois les frais de port, et André s'occupe de préparer votre commande avec soin !"
                }
              ].map((item) => (
                <Card key={item.step} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex gap-6 items-start">
                    <div className="bg-[#C6A15B] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900">{item.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-6 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-[#C6A15B]" />
              Les Règles du Jeu (F.A.Q)
            </h2>
            
            <div className="space-y-4">
              <Card className="bg-white border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#C6A15B]" />
                    Combien de temps mon colis peut-il rester ouvert ?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  Pour des raisons d&apos;organisation et de stockage dans notre atelier, vous pouvez garder un colis ouvert pendant 
                  <span className="font-bold text-gray-900"> 7 jours maximum </span> après votre premier achat. Passé ce délai, votre colis se fermera automatiquement pour être expédié.
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-[#C6A15B]" />
                    Puis-je mélanger des achats du site et des achats faits en Live ?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  Absolument ! Le Colis Ouvert est fait pour ça. Que vous achetiez une création artisanale un dimanche matin sur le site, ou un accessoire un jeudi soir pendant notre Live, tout atterrit dans le même carton.
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#C6A15B]" />
                    Les articles dans mon colis ouvert sont-ils vraiment réservés ?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  Oui à 100 % ! Dès que votre achat &quot;Colis Ouvert&quot; est validé et payé, le produit est retiré des stocks. Il est à vous, il vous attend.
                </CardContent>
              </Card>
            </div>
          </div>

          {/* APPEL À L'ACTION */}
          <Card className="bg-gradient-to-br from-[#D4AF37] to-[#b8933d] text-white">
            <CardContent className="p-8 text-center space-y-4">
              <MessageCircle className="h-10 w-10 mx-auto" />
              <h3 className="text-xl font-bold">Un doute sur votre colis en cours ?</h3>
              <p className="opacity-90">
                Vous ne savez plus ce qu&apos;il y a dans votre malle ou vous voulez de l&apos;aide pour déclencher l&apos;envoi ? 
                Pas de panique, le service Allo André est là pour vous accompagner.
              </p>
              <Button asChild variant="secondary" className="mt-4 bg-white text-[#D4AF37] hover:bg-gray-100">
                <Link href="/allo-andre">Contacter André</Link>
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}