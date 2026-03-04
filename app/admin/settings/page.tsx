'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Loader2, 
  Save, 
  Bell, 
  Coins, 
  RefreshCw,
  Tag 
} from 'lucide-react';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  is_active: boolean;
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState({
    top_bar_text: '',
    top_bar_is_active: true,
    top_bar_coupon_id: '',
    loyalty_max_cap: 30
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsRes, couponsRes] = await Promise.all([
        supabase.from('site_settings').select('*').eq('id', 'general').maybeSingle(),
        supabase.from('coupons').select('id, code, is_active').eq('is_active', true).order('code')
      ]);

      if (settingsRes.error) throw settingsRes.error;
      if (couponsRes.error) throw couponsRes.error;

      if (settingsRes.data) {
        setSettings({
          top_bar_text: settingsRes.data.top_bar_text || '',
          top_bar_is_active: settingsRes.data.top_bar_is_active ?? true,
          top_bar_coupon_id: settingsRes.data.top_bar_coupon_id || '',
          loyalty_max_cap: settingsRes.data.loyalty_max_cap || 30
        });
      }
      
      setCoupons(couponsRes.data || []);
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast.error('Erreur lors du chargement des réglages');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          id: 'general', 
          top_bar_text: settings.top_bar_text,
          top_bar_is_active: settings.top_bar_is_active,
          top_bar_coupon_id: settings.top_bar_coupon_id || null,
          loyalty_max_cap: settings.loyalty_max_cap,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Réglages enregistrés avec succès');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(`Erreur: ${error.message || 'Mise à jour impossible'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Réglages du site</h1>
          <p className="text-gray-600 mt-2">
            Gérez les paramètres globaux et les promotions de la boutique
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={saving}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 gap-2 text-white"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer les modifications
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Bar Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <CardTitle>Top bar</CardTitle>
            </div>
            <CardDescription>
              Configurez le bandeau d&apos;annonce et le coupon associé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="space-y-0.5">
                <Label htmlFor="top-bar-toggle">Activer le bandeau</Label>
                <p className="text-sm text-gray-500">Visible sur toutes les pages du site</p>
              </div>
              <Switch
                id="top-bar-toggle"
                checked={settings.top_bar_is_active}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, top_bar_is_active: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="top-bar-text">Texte de l&apos;annonce</Label>
              <Input
                id="top-bar-text"
                value={settings.top_bar_text}
                onChange={(e) => 
                  setSettings({ ...settings, top_bar_text: e.target.value })
                }
                placeholder="Ex: -15% avec le code PROMO15 !"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="top-bar-coupon" className="flex items-center gap-2">
                <Tag className="h-3 w-3 text-gray-400" /> Coupon lié
              </Label>
              <select
                id="top-bar-coupon"
                value={settings.top_bar_coupon_id}
                onChange={(e) => setSettings({ ...settings, top_bar_coupon_id: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Aucun coupon sélectionné</option>
                {coupons.map((coupon) => (
                  <option key={coupon.id} value={coupon.id}>
                    {coupon.code}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 italic">
                Ce coupon peut être utilisé pour un affichage automatique dans le panier.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-[#C6A15B]" />
              <CardTitle>Programme Fidélité</CardTitle>
            </div>
            <CardDescription>
              Gestion de la cagnotte client multipliée
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="loyalty-cap">Plafond maximum de la cagnotte (€)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="loyalty-cap"
                  type="number"
                  value={settings.loyalty_max_cap}
                  onChange={(e) => 
                    setSettings({ ...settings, loyalty_max_cap: parseFloat(e.target.value) || 0 })
                  }
                  className="w-32"
                />
                <span className="text-gray-500 font-medium">€</span>
              </div>
              <p className="text-sm text-gray-500">
                Limite maximale autorisée pour les bonus de fidélité multipliés.
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Important :</strong> Une fois le plafond de {settings.loyalty_max_cap}€ atteint, le client doit utiliser son solde pour recommencer à cumuler.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}