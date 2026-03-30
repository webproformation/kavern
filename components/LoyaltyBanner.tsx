'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PiggyBank, TrendingUp, Sparkles, Zap, Crown } from 'lucide-react';

const TIERS = [
  { min: 0, max: 5, multiplier: 1, name: 'Esprit curieux' },
  { min: 5, max: 15, multiplier: 2, name: 'Passionné' },
  { min: 15, max: Infinity, multiplier: 3, name: 'Collectionneur' }
];

export function LoyaltyBanner() {
  const { profile } = useAuth();

  if (!profile) {
    return null;
  }

  const loyaltyEuros = Number(profile.loyalty_euros) || 0;
  const walletBalance = Number(profile.wallet_balance) || 0;

  const getCurrentTier = () => {
    return TIERS.find(tier => loyaltyEuros >= tier.min && loyaltyEuros < tier.max) || TIERS[TIERS.length - 1];
  };

  const currentTier = getCurrentTier();
  const nextTier = TIERS.find(t => t.min > loyaltyEuros);

  const progress = nextTier
    ? ((loyaltyEuros - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  const remaining = nextTier ? nextTier.min - loyaltyEuros : 0;

  return (
    <div className="w-full bg-gradient-to-r from-[#D4AF37] via-[#C6A15B] to-[#D4AF37] border-b border-[#C6A15B]">
      <div className="container mx-auto px-2 md:px-4 py-1.5 md:py-3">
        <div className="flex items-center justify-between gap-2 md:gap-4 text-white w-full">
          {/* Mobile: tout sur une ligne compacte */}
          <div className="flex items-center gap-2 md:gap-6 overflow-x-auto whitespace-nowrap">
            <div className="flex items-center gap-1 md:gap-2">
              <PiggyBank className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium">
                <span className="font-bold text-sm md:text-lg">{loyaltyEuros.toFixed(2)}€</span>
              </span>
            </div>

            {walletBalance > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs md:text-sm font-medium">
                  Avoirs: <span className="font-bold">{walletBalance.toFixed(2)}€</span>
                </span>
              </div>
            )}

            <div className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 bg-white/20 rounded-full">
              {currentTier.multiplier === 3 ? (
                <Crown className="h-3 w-3 md:h-4 md:w-4" />
              ) : (
                <Zap className="h-3 w-3 md:h-4 md:w-4 fill-yellow-300" />
              )}
              <span className="text-[10px] md:text-sm font-bold">
                {currentTier.name} x{currentTier.multiplier}
              </span>
            </div>

            {/* Mobile: progression inline */}
            {nextTier && (
              <span className="text-[10px] md:hidden font-medium opacity-80">
                +{remaining.toFixed(2)}€ → {nextTier.name}
              </span>
            )}
          </div>

          {nextTier && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-xs font-medium">
                  Plus que {remaining.toFixed(2)}€ pour {nextTier.name}
                </span>
                <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {!nextTier && (
            <div className="hidden md:flex items-center gap-2 text-yellow-200">
              <Crown className="h-5 w-5" />
              <span className="text-sm font-bold">Palier maximum atteint !</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}