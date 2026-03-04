'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Flame, 
  Sparkles, 
  Gem, 
  History, 
  ShoppingBag, 
  Facebook, 
  Instagram,
  Star,
  Users,
  PackageSearch,
  Video,
  Youtube
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function QuiSommesNousPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F2F2E8]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* HEADER DE LA PAGE */}
          <PageHeader
            icon={History}
            title="Bienvenue dans la KAVERN"
            description="L'histoire de notre Concept Store"
          />

          {/* INTRODUCTION */}
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 text-center space-y-6">
              <p className="text-xl text-gray-800 leading-relaxed italic">
                &quot;Si vous êtes ici, c&apos;est que vous cherchez autre chose qu&apos;une simple boutique en ligne. 
                Vous cherchez de l&apos;authenticité, de la surprise, et surtout, du lien humain.&quot;
              </p>
              <p className="text-lg text-gray-700">
                Laissez-moi vous raconter comment est née la KAVERN, ce Concept Store unique où se rencontrent 
                <strong> l&apos;artisanat et l&apos;inattendu</strong>.
              </p>
            </CardContent>
          </Card>

          {/* SECTION 1 : LES BOUGIES */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Flame className="h-6 w-6 text-[#C6A15B]" />
                Tout a commencé par une flamme...
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Avant d&apos;être une boutique aux mille trésors, la KAVERN est avant tout l&apos;histoire d&apos;un artisan. 
                  Passionné par les ambiances chaleureuses et les belles matières, j&apos;ai commencé par créer mes propres 
                  <strong> bougies artisanales</strong>.
                </p>
                <p>
                  Coulées à la main avec passion, formulées avec de la cire végétale naturelle et des parfums de 
                  <strong> Grasse</strong> (la capitale mondiale de la parfumerie), mes bougies ont été le point de départ de cette aventure.
                </p>
                <p className="text-[#C6A15B] font-semibold">
                  C&apos;est cet amour du travail bien fait qui a posé la première pierre de notre devise : L&apos;Artisanat.
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center">
               <div className="text-center space-y-2">
                  <Flame className="h-16 w-16 text-[#C6A15B] mx-auto opacity-20" />
                  <p className="text-sm text-gray-400 uppercase tracking-widest">L&apos;Atelier d&apos;André</p>
               </div>
            </div>
          </div>

          {/* SECTION 2 : CONCEPT STORE */}
          <Card className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <PackageSearch className="h-6 w-6 text-[#C6A15B]" />
                De la bougie à la caverne d&apos;Ali Baba
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Très vite, en échangeant avec vous, l&apos;envie d&apos;aller plus loin est apparue. 
                J&apos;ai alors enfilé ma casquette de <strong>&quot;dénicheur de pépites&quot;</strong> pour vous proposer un Concept Store complet. 
                L&apos;idée était simple : réunir dans un seul et même endroit le meilleur du savoir-faire traditionnel et les trouvailles les plus surprenantes.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 pt-4">
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                  <h4 className="font-bold text-gray-900 mb-2">Le terroir et le fait-main</h4>
                  <p className="text-sm text-gray-600">
                    En nous associant avec des maisons prestigieuses (Le Châtelard 1802, Les Grands Gourmands, Graine Créative).
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">La surprise et la tendance</h4>
                  <p className="text-sm text-gray-600">
                    Accessoires de mode, décoration cocooning, loisirs créatifs et snacks du bout du monde.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION 3 : EXPERIENCE LIVE */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Video className="h-6 w-6 text-red-600" />
              Plus qu&apos;une boutique : Une expérience en Live
            </h2>
            <Card className="overflow-hidden border-none shadow-md">
              <CardContent className="p-8 bg-gray-900 text-white space-y-4">
                <p className="text-lg leading-relaxed opacity-90">
                  La KAVERN, ce n&apos;est pas un catalogue froid sur un écran. C&apos;est un lieu de vie ! 
                  À travers nos soirées <strong>Live Shopping</strong>, nous avons voulu recréer l&apos;ambiance chaleureuse du petit commerce de quartier, mais depuis votre canapé.
                </p>
                <p className="opacity-90">
                  On y discute, on rigole, je vous présente mes nouveautés en direct, et vous remplissez votre fameux 
                  <strong> &quot;Colis Ouvert&quot;</strong> à votre rythme, au fil de vos coups de cœur.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* MOT DE LA FIN & SIGNATURE */}
          <Card className="bg-gradient-to-br from-[#C6A15B] to-[#b8933d] text-white overflow-hidden relative">
            <CardContent className="p-10 text-center space-y-6 relative z-10">
              <p className="text-2xl leading-relaxed font-medium italic">
                &quot;Mon objectif ? Que chaque ouverture de colis KAVERN soit vécue comme un matin de Noël. 
                Un mélange d&apos;élégance artisanale et de petites surprises amusantes.&quot;
              </p>
              <div className="pt-6 border-t border-white/20">
                <p className="text-3xl font-bold">André</p>
                <p className="text-white/80 uppercase tracking-widest text-sm">Artisan cirier & Fondateur de KAVERN</p>
              </div>
            </CardContent>
            <Sparkles className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 rotate-12" />
          </Card>

          {/* RÉSEAUX SOCIAUX */}
          <div className="flex flex-col items-center gap-6 py-8">
            <h3 className="text-xl font-bold text-gray-900 text-center">
              Merci de faire partie de cette belle aventure.<br/>
              <span className="text-[#C6A15B]">À très vite en Live !</span>
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-[#1877F2] hover:bg-[#166fe5] rounded-full px-6">
                <a href="https://www.facebook.com/share/1ApxRYbs2v/" target="_blank" rel="noopener noreferrer" className="gap-2">
                  <Facebook className="h-5 w-5" /> Facebook
                </a>
              </Button>
              <Button asChild className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:opacity-90 rounded-full px-6 text-white">
                <a href="https://www.instagram.com/kavern2026?igsh=MTJ3bng1NmVyenV3ZA==" target="_blank" rel="noopener noreferrer" className="gap-2">
                  <Instagram className="h-5 w-5" /> Instagram
                </a>
              </Button>
              <Button asChild className="bg-black hover:bg-gray-800 rounded-full px-6">
                <a href="https://tiktok.com/@kavernfrance" target="_blank" rel="noopener noreferrer" className="gap-2 text-white">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  TikTok
                </a>
              </Button>
              <Button asChild className="bg-[#FF0000] hover:bg-[#cc0000] rounded-full px-6">
                <a href="https://youtube.com/@kavern2026?si=J9TTl72dAOTIuFrB" target="_blank" rel="noopener noreferrer" className="gap-2 text-white">
                  <Youtube className="h-5 w-5" /> YouTube
                </a>
              </Button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}