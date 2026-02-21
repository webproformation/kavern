"use client";

import { useState, useEffect } from "react";
import { Gem, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface HiddenDiamondProps {
  productId: string;
  position: "title" | "image" | "description";
  selectedPosition: "title" | "image" | "description";
}

export function HiddenDiamond({ productId, position, selectedPosition }: HiddenDiamondProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [isVisible, setIsVisible] = useState(position === selectedPosition);
  const [hasFoundDiamond, setHasFoundDiamond] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (user && profile) {
      checkIfAlreadyFound();
    }
  }, [user, profile, productId]);

  const checkIfAlreadyFound = async () => {
    if (!user || !profile) return;

    const { data, error } = await supabase
      .from("loyalty_euro_transactions")
      .select("id")
      .eq("user_id", profile.id)
      .eq("type", "diamond_found")
      .eq("description", `Diamant trouvé sur le produit ${productId}`)
      .maybeSingle();

    if (data) {
      setHasFoundDiamond(true);
      setIsVisible(false);
    }
  };

  const handleDiamondClick = async () => {
    if (!user || !profile || hasFoundDiamond || isAnimating) return;

    setIsAnimating(true);

    try {
      const { data, error } = await supabase.rpc('collect_hidden_diamond', {
        p_product_id: productId,
        p_description: `Diamant trouvé sur le produit ${productId}`
      });

      if (error) {
        throw error;
      }

      if (data) {
        const result = typeof data === 'string' ? JSON.parse(data) : data;
        const finalAmount = (0.10 * result.multiplier).toFixed(2);
        const multiplierText = result.multiplier > 1 ? ` (x${result.multiplier})` : '';

        // --- CORRECTION : MISE À JOUR DU HEADER EN TEMPS RÉEL ---
        await refreshProfile();
        window.dispatchEvent(new Event('loyaltyUpdated'));
        // -------------------------------------------------------

        toast.success(`Félicitations ! Vous avez gagné ${finalAmount} € !${multiplierText}`, {
          icon: <Gem className="h-4 w-4 fill-amber-500 text-amber-500" />,
          duration: 5000,
        });

        setHasFoundDiamond(true);

        setTimeout(() => {
          setIsVisible(false);
        }, 1000);
      }
    } catch (error) {
      console.error("Error collecting diamond:", error);
      toast.error("Une erreur est survenue");
      setIsAnimating(false);
    }
  };

  if (!isVisible || position !== selectedPosition) {
    return null;
  }

  return (
    <Button
      onClick={handleDiamondClick}
      disabled={isAnimating}
      variant="ghost"
      size="sm"
      className={`relative inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200 border bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg transition-all duration-500 group ${
        isAnimating ? 'scale-150 opacity-0' : 'animate-bounce'
      }`}
    >
      <Gem className={`h-4 w-4 fill-current ${isAnimating ? 'animate-ping' : ''}`} />
      <span className="font-bold text-xs uppercase tracking-widest">Pépite découverte !</span>
      <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-amber-400 animate-pulse" />
    </Button>
  );
}