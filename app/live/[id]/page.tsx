'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Play, Eye, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { ReplayChapters } from '@/components/ReplayChapters';
import { LiveProducts } from '@/components/LiveProducts';
import { LiveChat } from '@/components/LiveChat';
import PageHeader from '@/components/PageHeader';

export default function LiveReplayPage() {
  const { id } = useParams();
  const [live, setLive] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'chat'>('products');

  useEffect(() => {
    async function fetchLive() {
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) setLive(data);
      setLoading(false);
    }
    if (id) fetchLive();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#D4AF37] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!live) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Ce live n&apos;existe pas ou a ete supprime.</p>
        <Link href="/live"><Button variant="outline">Retour aux lives</Button></Link>
      </div>
    );
  }

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    }
    return url;
  };

  const replayUrl = live.replay_url || live.stream_url;
  const embedUrl = replayUrl ? getEmbedUrl(replayUrl) : null;
  const isYoutube = replayUrl?.includes('youtube') || replayUrl?.includes('youtu.be');

  return (
    <>
      <PageHeader title={live.title || 'Replay Live'} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/live" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#D4AF37] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour aux lives
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden bg-black">
              <div className="aspect-video relative">
                {isYoutube && embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : replayUrl ? (
                  <video ref={videoRef} src={replayUrl} controls className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Replay non disponible</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Info */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {live.actual_start && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(live.actual_start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
              {live.max_viewers > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" /> {live.max_viewers} spectateurs max
                </span>
              )}
              {live.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {Math.round(live.duration / 60)} min
                </span>
              )}
            </div>

            {live.description && (
              <p className="mt-3 text-gray-600">{live.description}</p>
            )}

            {/* Chapitres */}
            <div className="mt-6">
              <ReplayChapters liveStreamId={live.id} videoRef={videoRef} />
            </div>
          </div>

          {/* Sidebar: produits + chat */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant={activeTab === 'products' ? 'default' : 'outline'} onClick={() => setActiveTab('products')} className="flex-1">
                Produits
              </Button>
              <Button variant={activeTab === 'chat' ? 'default' : 'outline'} onClick={() => setActiveTab('chat')} className="flex-1">
                Chat
              </Button>
            </div>

            <Card className="h-[500px] overflow-hidden">
              {activeTab === 'products' ? (
                <LiveProducts liveStreamId={live.id} />
              ) : (
                <LiveChat liveStreamId={live.id} isReplay />
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
