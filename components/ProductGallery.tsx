"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import NextImage from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Search, PlayCircle, ChevronLeft, ChevronRight, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGalleryProps {
  images: Array<{ id: string; src: string; alt: string }>;
  productName: string;
  selectedImageUrl?: string;
  onImageClick?: (image: { id: string; src: string }) => void;
  videoUrl?: string; // Nouvelle prop pour la vidéo
}

export function ProductGallery({
  images,
  productName,
  selectedImageUrl,
  onImageClick,
  videoUrl,
}: ProductGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Fonction pour transformer les liens sociaux en Embed utilisables
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
    }
    
    // Instagram Reels
    if (url.includes('instagram.com/reel')) {
      const id = url.split('/reel/')[1]?.split('/')[0];
      return `https://www.instagram.com/reel/${id}/embed`;
    }

    // Facebook
    if (url.includes('facebook.com')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0`;
    }

    return url;
  };

  // On combine la vidéo et les images dans un seul tableau de média
  const allMedia = useMemo(() => {
    const media = [...images.map(img => ({ ...img, type: 'image' }))];
    if (videoUrl) {
      media.unshift({
        id: 'video-main',
        src: videoUrl,
        alt: 'Présentation vidéo',
        type: 'video'
      } as any);
    }
    return media;
  }, [images, videoUrl]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="relative group aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white shadow-xl border border-gray-100">
        <div className="w-full h-full" ref={emblaRef}>
          <div className="flex h-full">
            {allMedia.map((item: any, index) => (
              <div key={item.id} className="relative flex-[0_0_100%] min-w-0 h-full">
                {item.type === 'video' ? (
                  <div className="w-full h-full bg-black">
                    <iframe
                      src={getEmbedUrl(item.src) || ''}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <NextImage
                      src={item.src}
                      alt={item.alt || productName}
                      fill
                      priority={index === 0}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Boutons de navigation */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => emblaApi?.scrollPrev()}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => emblaApi?.scrollNext()}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Badge Vidéo si on est sur le slide vidéo */}
        {allMedia[selectedIndex]?.type === 'video' && (
          <div className="absolute top-6 left-6 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg flex items-center gap-1.5 animate-pulse">
            <PlayCircle className="h-3 w-3" /> Vidéo démo
          </div>
        )}
      </div>

      {/* Miniatures */}
      {allMedia.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
          {allMedia.map((item: any, index) => {
            const isSelected = selectedIndex === index;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(index)}
                className={cn(
                  "relative flex-[0_0_80px] aspect-square rounded-2xl overflow-hidden transition-all border-2",
                  isSelected ? "border-[#D4AF37] scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                {item.type === 'video' ? (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <Video className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                ) : (
                  <NextImage
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}