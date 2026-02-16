'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import { Truck, Package, MapPin, Printer, Search, Calendar, User, Phone, AlertTriangle, Layers } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  shipping_address: any;
  relay_point_data: any;
  shipping_method_id: string;
  user_id: string;
  total: number;
  total_virtual_weight: number; // Nouveau
  shipping_type: 'immediate' | 'open_package'; // Nouveau
}

export default function ExpeditionsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'immediate' | 'open'>('immediate');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Logique pour regrouper les commandes de "Colis Ouverts" par utilisateur
  const openPackagesGroups = orders
    .filter(o => o.shipping_type === 'open_package' && o.status !== 'shipped')
    .reduce((acc: any, order) => {
      if (!acc[order.user_id]) {
        acc[order.user_id] = { orders: [], totalWeight: 0, lastUpdate: order.created_at };
      }
      acc[order.user_id].orders.push(order);
      acc[order.user_id].totalWeight += (order.total_virtual_weight || 0);
      return acc;
    }, {});

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesView = view === 'immediate' ? order.shipping_type === 'immediate' : order.shipping_type === 'open_package';
    return matchesSearch && matchesView;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Truck className="h-8 w-8 text-[#D4AF37]" />
            Gestion des Expéditions
          </h1>
          <p className="text-gray-600 mt-2">Préparez vos colis et suivez les poids virtuels</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <Button 
            variant={view === 'immediate' ? 'default' : 'ghost'} 
            onClick={() => setView('immediate')}
            className={view === 'immediate' ? 'bg-[#b8933d]' : ''}
          >
            Envois Immédiats
          </Button>
          <Button 
            variant={view === 'open' ? 'default' : 'ghost'} 
            onClick={() => setView('open')}
            className={view === 'open' ? 'bg-[#b8933d]' : ''}
          >
            Colis Ouverts
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par numéro de commande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {view === 'open' ? (
        <div className="grid gap-6">
          {Object.keys(openPackagesGroups).length === 0 ? (
            <p className="text-center py-10 text-gray-500 italic">Aucun colis ouvert en cours.</p>
          ) : (
            Object.entries(openPackagesGroups).map(([userId, data]: any) => {
              const weightKg = (data.totalWeight / 1000).toFixed(2);
              const percent = Math.min((data.totalWeight / 20000) * 100, 100);
              const isOverLimit = data.totalWeight >= 20000;

              return (
                <Card key={userId} className={`border-2 ${isOverLimit ? 'border-red-500 shadow-red-50' : 'border-[#D4AF37]/30'}`}>
                  <CardHeader className="bg-gray-50/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#b8933d] p-2 rounded-full text-white">
                          <Layers className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Colis Cumulé - Client {userId.slice(0,8)}</CardTitle>
                          <CardDescription>{data.orders.length} commande(s) à l&apos;intérieur</CardDescription>
                        </div>
                      </div>
                      <div className="w-full md:w-64 space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Remplissage virtuel</span>
                          <span className={isOverLimit ? 'text-red-600' : 'text-gray-600'}>{weightKg}kg / 20kg</span>
                        </div>
                        <Progress value={percent} className={`h-2 ${isOverLimit ? 'bg-red-100' : ''}`} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {isOverLimit && (
                      <div className="flex items-center gap-2 text-red-600 mb-4 bg-red-50 p-2 rounded text-sm font-bold animate-pulse">
                        <AlertTriangle className="h-4 w-4" />
                        Attention : Le client a atteint la limite de 20kg. Le colis doit être fermé.
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Commandes incluses :</p>
                      <div className="flex flex-wrap gap-2">
                        {data.orders.map((o: Order) => (
                          <Badge key={o.id} variant="outline" className="bg-white">
                            {o.order_number} ({o.total_virtual_weight}g)
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                       <Button variant="outline" size="sm" className="flex-1"><Printer className="h-4 w-4 mr-2" /> Bon de préparation</Button>
                       <Button size="sm" className="flex-1 bg-[#b8933d] hover:bg-[#a07c2f]">Clôturer et Demander Paiement Port</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-md">Commande {order.order_number}</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800 border-none">Envoi Immédiat</Badge>
                </div>
                <CardDescription>Poids estimé : {order.total_virtual_weight || 0}g</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-end">
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-black">{order.shipping_address?.first_name} {order.shipping_address?.last_name}</p>
                  <p>{order.shipping_address?.city} ({order.shipping_address?.postal_code})</p>
                </div>
                <Button className="bg-[#b8933d]"><Printer className="h-4 w-4 mr-2" /> Étiquette</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}