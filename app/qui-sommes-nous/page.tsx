import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Sparkles, 
  ShoppingBag, 
  UserCircle, 
  Flame, 
  Tag, 
  Leaf, 
  Eye, 
  ShieldCheck, 
  Facebook, 
  Instagram,
  Gem,
  Search
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

export default function QuiSommesNousPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F2F2E8]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* HEADER DE LA PAGE */}
          <PageHeader
            icon={UserCircle}
            title="Bienvenue dans la Kavern d'André"
            description="L'histoire d'une passion, de l'artisanat aux bonnes affaires."
          />

          {/* INTRODUCTION PERSONNELLE */}
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Bonjour et bienvenue chez moi... ou plutôt, chez vous !</h2>
                <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                  <p>
                    Moi, c'est <strong>André</strong>. Certains me connaissent sous le surnom de <strong>&quot;Doudou&quot;</strong>, 
                    un surnom qui me colle à la peau et qui résume bien l'esprit de ce site : 
                    de la douceur, de la proximité et de la simplicité.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* POURQUOI KAVERN */}
          <Card className="bg-gradient-to-br from-[#D4AF37]/10 to-[#b8933d]/10 border-[#C6A15B] border-l-4">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Search className="h-8 w-8 text-[#C6A15B]" />
                <CardTitle className="text-2xl">Pourquoi &quot;Kavern&quot; ?</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed text-lg">
                On m'a souvent demandé pourquoi ce nom. La réponse est simple : j'ai toujours aimé fouiller pour dénicher <strong>LA pépite</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Je voulais créer un endroit en ligne qui ressemble à une véritable caverne aux trésors, mais une caverne moderne et organisée. 
                Un lieu où l'on ne vient pas seulement acheter &quot;un produit&quot;, mais où l'on vient se faire plaisir sans culpabiliser pour son portefeuille.
              </p>
            </CardContent>
          </Card>

          {/* LE CONCEPT UNIQUE */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Gem className="h-6 w-6 text-[#C6A15B]" />
              Un concept unique : Le mariage de l'Artisanat et de la Débrouille
            </h2>
            <p className="text-gray-600">Kavern n'est pas un site e-commerce comme les autres. C'est le mélange de mes deux univers :</p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* L'ARTISAN */}
              <Card className="overflow-hidden border-none shadow-md">
                <div className="bg-[#C6A15B] p-4 flex items-center gap-3 text-white">
                  <Flame className="h-6 w-6" />
                  <h3 className="font-bold">1. L'Artisan Créateur</h3>
                </div>
                <CardContent className="p-6 bg-white">
                  <p className="text-gray-700 leading-relaxed">
                    C'est mon jardin secret. Je coule moi-même mes <strong>bougies artisanales</strong> dans mon atelier. 
                    J'aime travailler la cire, imaginer des parfums gourmands (comme mes fameuses bougies chantilly !) 
                    et créer cette ambiance cocooning qui fait du bien au moral.
                  </p>
                  <p className="mt-4 text-[#C6A15B] font-semibold italic">
                    &quot;Quand vous achetez une bougie L'Atelier d'André, vous achetez une part de mon savoir-faire.&quot;
                  </p>
                </CardContent>
              </Card>

              {/* LE DENICHEUR */}
              <Card className="overflow-hidden border-none shadow-md">
                <div className="bg-gray-800 p-4 flex items-center gap-3 text-white">
                  <Tag className="h-6 w-6" />
                  <h3 className="font-bold">2. Le Dénicheur de Bons Plans</h3>
                </div>
                <CardContent className="p-6 bg-white">
                  <p className="text-gray-700 leading-relaxed">
                    Je sais que la vie est chère. Alors, je me bats au quotidien pour vous trouver des produits de 
                    <strong> grandes marques</strong> (hygiène, maison, épicerie) à des prix &quot;Kavern&quot;. 
                    Je travaille avec des partenaires de confiance pour vous proposer des arrivages permanents.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* NOS VALEURS */}
          <div className="space-y-6 pt-4">
            <h2 className="text-2xl font-bold text-gray-900">Nos Valeurs (Ce qui nous tient à cœur)</h2>
            <div className="grid gap-4">
              <div className="flex gap-4 items-start bg-white p-6 rounded-2xl border shadow-sm">
                <div className="bg-green-100 p-3 rounded-full shrink-0">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">L'Anti-Gaspillage</h4>
                  <p className="text-gray-600 text-sm md:text-base">
                    Avec notre rayon <strong>&quot;Seconde Main & Friperie&quot;</strong>, nous donnons une deuxième vie aux vêtements. 
                    C'est bon pour la planète et c'est doux pour votre budget.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white p-6 rounded-2xl border shadow-sm">
                <div className="bg-blue-100 p-3 rounded-full shrink-0">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">La Transparence</h4>
                  <p className="text-gray-600 text-sm md:text-base">
                    Ici, pas de fausses promesses. Si un produit est un &quot;dupe&quot; de parfum, on vous le dit. 
                    Si c'est un arrivage unique, on vous prévient.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white p-6 rounded-2xl border shadow-sm">
                <div className="bg-amber-100 p-3 rounded-full shrink-0">
                  <ShieldCheck className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">La Proximité</h4>
                  <p className="text-gray-600 text-sm md:text-base">
                    Derrière votre écran, il n'y a pas un robot ou une multinationale. Il y a André. 
                    Je prépare vos colis, je réponds à vos messages et je m'assure que tout arrive entier chez vous.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MOT DE LA FIN */}
          <Card className="bg-gradient-to-br from-[#C6A15B] to-[#b8933d] text-white overflow-hidden">
            <CardContent className="p-10 text-center space-y-6">
              <p className="text-xl leading-relaxed">
                Que vous veniez pour une bougie qui sent bon le dimanche matin, pour remplir vos placards de gâteaux 
                ou pour trouver une veste vintage unique, vous êtes ici chez vous.
              </p>
              <p className="text-lg font-medium">
                Merci de faire vivre le petit commerce et l'artisanat français.
              </p>
              <div className="pt-6">
                <p className="text-3xl font-bold font-serif italic">Bonne fouille dans la Kavern !</p>
                <div className="mt-4">
                    <p className="text-2xl font-bold">André (Doudou)</p>
                    <p className="text-white/80">Votre dénicheur passionné</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RÉSEAUX SOCIAUX */}
          <div className="flex flex-col items-center gap-6 py-8">
            <h3 className="text-xl font-bold text-gray-900">On garde le contact ?</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-[#1877F2] hover:bg-[#166fe5] rounded-full px-6">
                <a href="https://facebook.com/kavern.france" target="_blank" rel="noopener noreferrer" className="gap-2">
                  <Facebook className="h-5 w-5" /> Facebook
                </a>
              </Button>
              <Button asChild className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:opacity-90 rounded-full px-6 text-white">
                <a href="https://instagram.com/kavern-france" target="_blank" rel="noopener noreferrer" className="gap-2">
                  <Instagram className="h-5 w-5" /> Instagram
                </a>
              </Button>
              <Button asChild className="bg-black hover:bg-gray-800 rounded-full px-6">
                <a href="https://tiktok.com/@kavern-france" target="_blank" rel="noopener noreferrer" className="gap-2">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg> TikTok
                </a>
              </Button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}