'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, PiggyBank, TrendingUp, Star, Sparkles } from 'lucide-react';

const TIERS = [
  { name: 'Esprit Curieux', multiplier: 1, color: 'bg-gray-100 text-gray-800', min: 0, max: 5 },
  { name: 'Passionné', multiplier: 2, color: 'bg-blue-100 text-blue-800', min: 5, max: 15 },
  { name: 'Collectionneur', multiplier: 3, color: 'bg-[#D4AF37]/20 text-[#D4AF37]', min: 15, max: Infinity },
];

export default function LoyaltyPage() {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadTransactions();
  }, [user]);

  async function loadTransactions() {
    try {
      const { data } = await supabase
        .from('loyalty_euro_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setTransactions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const loyaltyEuros = profile?.loyalty_euros || 0;
  const walletBalance = profile?.wallet_balance || 0;
  const currentTier = TIERS.slice().reverse().find(t => loyaltyEuros >= t.min) || TIERS[0];
  const nextTier = TIERS.find(t => t.min > loyaltyEuros && t.max !== Infinity) || null;

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-[#D4AF37]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Ma Cagnotte & Fidélité</h2>
        <p className="text-gray-600">Votre programme de fidélité KAVERN</p>
      </div>

      {/* SOLDES */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-[#D4AF37]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Cagnotte Fidélité</p>
                <p className="text-4xl font-bold text-[#D4AF37] mt-1">{loyaltyEuros.toFixed(2)} &euro;</p>
              </div>
              <PiggyBank className="h-12 w-12 text-[#D4AF37]/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Porte-Monnaie (Avoirs)</p>
                <p className="text-4xl font-bold text-purple-600 mt-1">{walletBalance.toFixed(2)} &euro;</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RANG & PROGRESSION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-[#D4AF37]" />
            Mon Rang
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge className={`text-lg px-4 py-2 ${currentTier.color}`}>
              {currentTier.name} (x{currentTier.multiplier})
            </Badge>
            <p className="text-sm text-gray-600">
              Tous vos gains sont multipliés par <strong>{currentTier.multiplier}</strong>
            </p>
          </div>

          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progression vers {nextTier.name}</span>
                <span className="font-bold">{loyaltyEuros.toFixed(2)} / {nextTier.min}€ ({nextTier.name})</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#D4AF37] h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (loyaltyEuros / nextTier.min) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-4">
            {TIERS.map(tier => (
              <div key={tier.name} className={`text-center p-3 rounded-lg border ${currentTier.name === tier.name ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-100'}`}>
                <p className="font-bold text-sm">{tier.name}</p>
                <p className="text-lg font-black text-[#D4AF37]">x{tier.multiplier}</p>
                <p className="text-xs text-gray-500">{tier.max === Infinity ? `${tier.min}€+` : `${tier.min}-${tier.max}€`}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* COMMENT GAGNER */}
      <Card className="bg-[#D4AF37]/5 border-[#D4AF37]/20">
        <CardContent className="pt-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#D4AF37]" />
            Comment gagner des euros ?
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { action: 'Cashback sur chaque achat', gain: '2% du montant' },
              { action: 'Avis sur le Livre d\'Or', gain: '0,20 €' },
              { action: 'Pépite Diamant découverte', gain: '0,10 €' },
              { action: 'Connexion quotidienne', gain: '0,10 €' },
              { action: 'Présence en Live (10 min)', gain: '0,20 €' },
              { action: 'Parrainage réussi', gain: '5,00 €' },
            ].map(({ action, gain }) => (
              <div key={action} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                <span className="text-sm text-gray-700">{action}</span>
                <Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]">+{gain}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* HISTORIQUE */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des gains</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucune transaction pour le moment</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.description || tx.type}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{Number(tx.amount).toFixed(2)} &euro;
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
