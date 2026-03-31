'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Calendar, Bell, MessageCircle, ShoppingBag, Sparkles, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { LiveVideoPlayer } from '@/components/LiveVideoPlayer';
import { LiveProgressBar } from '@/components/LiveProgressBar';
import { LiveTickerBanner } from '@/components/LiveTickerBanner';
import { LiveEmotionBar } from '@/components/LiveEmotionBar';
import { LiveChat } from '@/components/LiveChat';
import { LiveProducts } from '@/components/LiveProducts';
import { ChestDrawing } from '@/components/ChestDrawing';
import { ReplayChapters } from '@/components/ReplayChapters';
import { PushNotificationButton } from '@/components/PushNotificationButton';
import { LiveCountdown } from '@/components/LiveCountdown';

interface LiveStream {
  id: string;
  title: string;
  description: string | null;
  status: string;
  scheduled_start: string;
  playback_url: string | null;
  replay_url: string | null;
  thumbnail_url: string | null;
  viewer_goal: number;
  ticker_text: string | null;
  chest_unlocked: boolean;
  current_viewers: number | null;
  total_views: number | null;
}

export default function LivePage() {
  const { profile } = useAuth();
  const [currentLive, setCurrentLive] = useState<LiveStream | null>(null);
  const [upcomingLives, setUpcomingLives] = useState<LiveStream[]>([]);
  const [replays, setReplays] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLives();

    const channel = supabase
      .channel('live_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_streams',
        },
        () => {
          loadLives();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (currentLive && profile) {
      joinAsViewer();

      return () => {
        leaveAsViewer();
      };
    }
  }, [currentLive, profile]);

  async function loadLives() {
    try {
      const { data: liveData } = await supabase
        .from('live_streams')
        .select('*')
        .eq('status', 'live')
        .maybeSingle();

      const { data: scheduledData } = await supabase
        .from('live_streams')
        .select('*')
        .eq('status', 'scheduled')
        .order('scheduled_start', { ascending: true })
        .limit(5);

      const { data: replayData } = await supabase
        .from('live_streams')
        .select('*')
        .eq('status', 'ended')
        .not('replay_url', 'is', null)
        .order('scheduled_start', { ascending: false })
        .limit(6);

      setCurrentLive(liveData);
      setUpcomingLives(scheduledData || []);
      setReplays(replayData || []);
    } catch (error) {
      console.error('Error loading lives:', error);
    } finally {
      setLoading(false);
    }
  }

  async function joinAsViewer() {
    if (!currentLive || !profile) return;

    await supabase
      .from('live_viewers')
      .insert({
        live_stream_id: currentLive.id,
        user_id: profile.id,
        is_active: true
      });
  }

  async function leaveAsViewer() {
    if (!currentLive || !profile) return;

    await supabase
      .from('live_viewers')
      .update({
        is_active: false,
        left_at: new Date().toISOString()
      })
      .eq('live_stream_id', currentLive.id)
      .eq('user_id', profile.id)
      .eq('is_active', true);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (currentLive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <LiveTickerBanner text={currentLive.ticker_text || 'Bienvenue dans le live KAVERN ! 💎'} />

        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <LiveVideoPlayer
                liveStreamId={currentLive.id}
                playbackUrl={currentLive.playback_url || ''}
                isLive={true}
              />

              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">
                  {currentLive.title}
                </h1>
                <LiveEmotionBar liveStreamId={currentLive.id} />
              </div>

              <LiveProgressBar
                liveStreamId={currentLive.id}
                viewerGoal={currentLive.viewer_goal}
              />

              <ChestDrawing
                liveStreamId={currentLive.id}
                isUnlocked={currentLive.chest_unlocked}
                isAdmin={profile?.is_admin || false}
              />

              {currentLive.description && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <p className="text-gray-300">{currentLive.description}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-gray-800 border-gray-700 h-[700px] flex flex-col">
                <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                  <TabsList className="bg-gray-900 border-b border-gray-700">
                    <TabsTrigger value="chat" className="flex-1">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="products" className="flex-1">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Produits
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat" className="flex-1 overflow-hidden m-0">
                    <LiveChat liveStreamId={currentLive.id} />
                  </TabsContent>

                  <TabsContent value="products" className="flex-1 overflow-auto m-0">
                    <LiveProducts liveStreamId={currentLive.id} />
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F2F2E8]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* HERO HEADER — Prochain Live avec Countdown */}
          {upcomingLives.length > 0 && (
            <div className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black p-8 md:p-12 text-center">
              <div className="absolute inset-0 opacity-20">
                {upcomingLives[0].thumbnail_url && (
                  <img src={upcomingLives[0].thumbnail_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="relative z-10 space-y-6">
                <Badge className="bg-red-600 text-white text-sm px-4 py-1.5 animate-pulse">PROCHAIN DIRECT</Badge>
                <h1 className="text-3xl md:text-5xl font-bold text-white">{upcomingLives[0].title}</h1>
                {upcomingLives[0].description && (
                  <p className="text-white/70 text-lg max-w-xl mx-auto">{upcomingLives[0].description}</p>
                )}

                {/* COUNTDOWN */}
                <LiveCountdown scheduledStart={upcomingLives[0].scheduled_start} />

                <p className="text-[#D4AF37] font-semibold">
                  {new Date(upcomingLives[0].scheduled_start).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </p>

                <PushNotificationButton />
              </div>
            </div>
          )}

          {!upcomingLives.length && (
            <PageHeader
              icon={Video}
              title="Live Shopping & Replay"
              description="Rejoignez-nous en direct pour découvrir nos nouveautés et profiter d'offres exclusives"
            />
          )}

          {/* 3 COLONNES CONCEPT */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center border-none shadow-sm">
              <CardContent className="pt-8 pb-6 space-y-3">
                <div className="mx-auto w-14 h-14 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-7 w-7 text-[#D4AF37]" />
                </div>
                <h3 className="font-bold text-gray-900">Un moment de partage</h3>
                <p className="text-sm text-gray-600">Oubliez le shopping ennuyeux, venez rigoler et découvrir nos pépites en direct.</p>
              </CardContent>
            </Card>
            <Card className="text-center border-none shadow-sm">
              <CardContent className="pt-8 pb-6 space-y-3">
                <div className="mx-auto w-14 h-14 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-7 w-7 text-[#D4AF37]" />
                </div>
                <h3 className="font-bold text-gray-900">Le Colis Ouvert</h3>
                <p className="text-sm text-gray-600">Regroupez vos achats sur 7 jours, ne payez les frais de port qu&apos;une fois !</p>
              </CardContent>
            </Card>
            <Card className="text-center border-none shadow-sm">
              <CardContent className="pt-8 pb-6 space-y-3">
                <div className="mx-auto w-14 h-14 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-[#D4AF37]" />
                </div>
                <h3 className="font-bold text-gray-900">Le Coffre & Les Cadeaux</h3>
                <p className="text-sm text-gray-600">Faites monter l&apos;énergie du Live et gagnez des surprises en direct.</p>
              </CardContent>
            </Card>
          </div>

          {upcomingLives.length > 1 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Prochains Lives
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {upcomingLives.slice(1).map((live) => (
                  <Card key={live.id} className="overflow-hidden border-2 border-blue-200 bg-blue-50">
                    {live.thumbnail_url && (
                      <div className="relative aspect-video">
                        <img
                          src={live.thumbnail_url}
                          alt={live.title}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-4 left-4 bg-blue-600">
                          📅 Programmé
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2">{live.title}</h3>
                      <p className="text-gray-600 mb-4">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        {formatDate(live.scheduled_start)}
                      </p>
                      {live.description && (
                        <p className="text-gray-700 text-sm line-clamp-2">
                          {live.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* FAQ ACCORDÉON */}
          <Card className="mb-12 border-none shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
              <div className="space-y-3">
                {[
                  { q: 'Faut-il un compte pour participer ?', a: 'Vous pouvez regarder le live sans compte, mais pour acheter ou participer au chat, il faut être connecté(e). L\'inscription est gratuite et prend 30 secondes !' },
                  { q: 'Comment payer pendant un live ?', a: 'Ajoutez les produits à votre panier pendant le direct, puis finalisez votre commande normalement via la page panier. Vous pouvez payer par carte, PayPal ou virement.' },
                  { q: 'Et si je rate le live ?', a: 'Pas de panique ! Tous nos lives sont enregistrés et disponibles en replay avec navigation par chapitres. Vous pouvez acheter les produits présentés après le direct.' },
                  { q: 'Qu\'est-ce que le Colis Ouvert ?', a: 'C\'est notre système exclusif : regroupez vos achats sur 7 jours et ne payez les frais de port qu\'une seule fois. Idéal pour craquer sur plusieurs lives sans exploser les frais !' },
                ].map(({ q, a }, idx) => (
                  <details key={idx} className="group border border-gray-100 rounded-lg">
                    <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-sm text-gray-900 hover:text-[#D4AF37]">
                      {q}
                      <ChevronDown className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="px-4 pb-4 text-sm text-gray-600">{a}</p>
                  </details>
                ))}
              </div>
            </CardContent>
          </Card>

          {replays.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                📼 Replays Disponibles
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {replays.map((live) => (
                  <Link
                    key={live.id}
                    href={`/live/${live.id}`}
                    className="group"
                  >
                    <Card className="overflow-hidden border border-gray-200 hover:shadow-xl transition-all">
                      <div className="relative aspect-video bg-gray-100">
                        {live.thumbnail_url ? (
                          <img
                            src={live.thumbnail_url}
                            alt={live.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <Badge className="absolute bottom-2 right-2 bg-black/80">
                          {live.total_views || 0} vues
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
                          {live.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(live.scheduled_start)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-2 mb-12">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-[#C6A15B]" />
                  <h3 className="text-xl font-bold">Horaires des lives</h3>
                </div>
                <div>
                  <p className="font-semibold">Facebook Live</p>
                  <p className="text-gray-600">Plusieurs fois par semaine</p>
                </div>
                <div>
                  <p className="font-semibold">TikTok Live</p>
                  <p className="text-gray-600">Sessions spéciales</p>
                </div>
                <p className="text-sm text-gray-500">
                  Les horaires sont annoncés sur nos réseaux sociaux. Suivez-nous pour ne rien manquer !
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-6 w-6 text-[#C6A15B]" />
                  <h3 className="text-xl font-bold">Notifications</h3>
                </div>
                <p className="text-gray-600">
                  Activez les notifications pour être alerté(e) au démarrage de chaque live.
                </p>
                <div className="space-y-2">
                  <PushNotificationButton />
                  <Button asChild className="w-full" variant="outline">
                    <a
                      href="https://www.facebook.com/share/1ApxRYbs2v/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Suivre sur Facebook
                    </a>
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <a
                      href="https://tiktok.com/@kavernfrance"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Suivre sur TikTok
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#C6A15B]/5 border-[#C6A15B]/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">Pourquoi participer à nos lives ?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#C6A15B] flex-shrink-0 mt-0.5" />
                  <p>Découvrez nos nouveautés en avant-première</p>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#C6A15B] flex-shrink-0 mt-0.5" />
                  <p>Profitez d&apos;offres exclusives réservées aux participants</p>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#C6A15B] flex-shrink-0 mt-0.5" />
                  <p>Posez vos questions en direct</p>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#C6A15B] flex-shrink-0 mt-0.5" />
                  <p>Participez à nos jeux et tirages au sort pour gagner des cadeaux</p>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#C6A15B] flex-shrink-0 mt-0.5" />
                  <p>Profitez d&apos;une ambiance conviviale et chaleureuse</p>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* BLOC SEO — Texte optimisé pour le référencement */}
          <div className="mt-12 space-y-8 text-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Shopping KAVERN : L&apos;Artisanat, l&apos;Inattendu et la Convivialité en Direct</h2>
              <p className="leading-relaxed">
                Bienvenue sur la page officielle du Live Shopping KAVERN, le rendez-vous incontournable des amoureux de
                l&apos;artisanat français et des créations originales. Oubliez l&apos;e-commerce traditionnel et plongez dans une
                expérience interactive unique. Chaque semaine, André vous ouvre les portes de sa caverne d&apos;Ali Baba pour
                des soirées placées sous le signe de la bonne humeur, de l&apos;authenticité et des découvertes surprenantes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Pourquoi participer à nos soirées Shopping en Direct ?</h2>
              <p className="leading-relaxed">
                Le Live Shopping chez KAVERN, c&apos;est avant tout un moment de vie. En rejoignant notre direct, vous ne faites
                pas que remplir un panier : vous rencontrez une communauté passionnée (nos fidèles copinettes !), vous posez
                vos questions en temps réel, et vous découvrez nos produits sous tous les angles. Des bougies gourmandes en
                trompe-l&apos;œil saisissantes de réalisme aux pépites d&apos;épicerie fine, chaque article est présenté avec
                passion et transparence.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Des innovations pensées pour vous : Le Colis Ouvert et le Direct-to-Cart</h2>
              <p className="leading-relaxed">
                Nous avons révolutionné la façon dont vous achetez en ligne. Grâce à notre système &quot;Direct-to-Cart&quot;,
                ajoutez vos coups de cœur à votre panier sans jamais quitter l&apos;émission des yeux. Vous craquez sur
                plusieurs de nos rendez-vous hebdomadaires ? Profitez de notre concept exclusif de &quot;Colis Ouvert&quot; :
                regroupez vos achats sur une période de 7 jours (jusqu&apos;à 10 kg) et ne payez les frais d&apos;expédition
                qu&apos;une seule fois !
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Animations, Tirages au sort et Replays intelligents</h2>
              <p className="leading-relaxed">
                L&apos;adrénaline fait partie de l&apos;expérience KAVERN. Participez activement dans le chat pour faire grimper
                la Jauge Vivante et tentez d&apos;ouvrir le mythique Coffre de la Kavern pour remporter des cadeaux en direct.
                Vous avez manqué une diffusion ? Pas de panique. Notre vidéothèque de replays intelligents vous permet de
                revoir nos émissions et de naviguer directement vers les chapitres et les produits qui vous intéressent.
                Rejoignez l&apos;aventure et remettez de l&apos;humain dans votre shopping en ligne !
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Achetez en toute sérénité lors de nos Lives</h3>
              <ul className="space-y-3 text-sm">
                <li><strong>Droit à l&apos;erreur (14 jours) :</strong> Un article ne vous convient pas ? Vous disposez de 14 jours
                  après réception pour nous le retourner et demander un avoir ou un remboursement.</li>
                <li><strong>Garantie Sérénité Livraison :</strong> Votre commande est sous notre responsabilité.
                  En cas de perte, notre garantie assure un renvoi ou un remboursement rapide.</li>
                <li><strong>Hygiène &amp; Sécurité :</strong> Pour des raisons d&apos;hygiène et de protection de la santé,
                  les cosmétiques dont l&apos;opercule a été retiré ainsi que les produits d&apos;épicerie fine ouverts
                  ne peuvent faire l&apos;objet d&apos;un droit de rétractation.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
