'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateInvoicePDF } from '@/lib/invoiceGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Download, Send, FileText, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface InvoiceRow {
  id: string;
  invoice_number: string;
  order_id: string;
  user_id: string;
  type: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  status: string;
  issued_at: string;
  created_at: string;
  // Jointures
  order?: any;
  profile?: any;
}

export default function AdminInvoicesListingPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrichir avec les infos commande et client
      const orderIds = [...new Set((data || []).map(i => i.order_id).filter(Boolean))];
      const userIds = [...new Set((data || []).map(i => i.user_id).filter(Boolean))];

      const [ordersRes, profilesRes] = await Promise.all([
        orderIds.length > 0
          ? supabase.from('orders').select('id, order_number, shipping_address, total').in('id', orderIds)
          : Promise.resolve({ data: [] }),
        userIds.length > 0
          ? supabase.from('profiles').select('id, first_name, last_name, email').in('id', userIds)
          : Promise.resolve({ data: [] }),
      ]);

      const ordersMap = new Map((ordersRes.data || []).map(o => [o.id, o]));
      const profilesMap = new Map((profilesRes.data || []).map(p => [p.id, p]));

      const enriched = (data || []).map(inv => ({
        ...inv,
        order: ordersMap.get(inv.order_id),
        profile: profilesMap.get(inv.user_id),
      }));

      setInvoices(enriched);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (inv: InvoiceRow) => {
    if (inv.profile) return `${inv.profile.first_name || ''} ${inv.profile.last_name || ''}`.trim();
    if (inv.order?.shipping_address) return `${inv.order.shipping_address.first_name || ''} ${inv.order.shipping_address.last_name || ''}`.trim();
    return 'Client inconnu';
  };

  const handleDownloadPDF = async (inv: InvoiceRow) => {
    try {
      if (!inv.order) {
        toast.error('Commande introuvable');
        return;
      }
      const { data: orderItems } = await supabase.from('order_items').select('*').eq('order_id', inv.order_id);
      const { data: profileData } = inv.order.user_id
        ? await supabase.from('profiles').select('first_name, last_name, email, phone').eq('id', inv.order.user_id).single()
        : { data: null };
      const orderForPdf = {
        ...inv.order,
        items: orderItems || [],
        order_items: orderItems || [],
        profiles: profileData || {},
        payment_method: 'N/A',
      };
      const doc = await generateInvoicePDF(orderForPdf, inv.order.order_number);
      doc.save(`Facture_${inv.invoice_number}.pdf`);
    } catch (error: any) {
      toast.error(`Erreur PDF: ${error.message}`);
    }
  };

  const handleSendEmail = async (inv: InvoiceRow) => {
    setSendingId(inv.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ invoiceId: inv.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erreur d'envoi");
      toast.success(`Facture envoyée à ${getCustomerName(inv)}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSendingId(null);
    }
  };

  const exportComptableCSV = () => {
    const rows: string[] = ['N° Facture;Date;Client;Email;Montant HT;TVA;Montant TTC;Statut;N° Commande'];
    invoices.forEach(inv => {
      const name = getCustomerName(inv);
      const email = inv.profile?.email || '';
      const date = format(new Date(inv.issued_at || inv.created_at), 'dd/MM/yyyy');
      const orderNum = inv.order?.order_number || '';
      rows.push(`"${inv.invoice_number}";"${date}";"${name}";"${email}";"${Number(inv.subtotal).toFixed(2)}";"${Number(inv.tax_amount).toFixed(2)}";"${Number(inv.total).toFixed(2)}";"${inv.status}";"${orderNum}"`);
    });
    const blob = new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-factures-kavern-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export comptable téléchargé');
  };

  const filteredInvoices = invoices.filter(inv => {
    const name = getCustomerName(inv).toLowerCase();
    const num = (inv.invoice_number || '').toLowerCase();
    const orderNum = (inv.order?.order_number || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return num.includes(term) || name.includes(term) || orderNum.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#b8933d] to-[#d4af37] bg-clip-text text-transparent">
            Gestion des Factures
          </h1>
          <p className="text-gray-500 mt-1">
            {invoices.length} facture(s) générée(s) — 1 expédition = 1 facture
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportComptableCSV} variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
            <Download className="h-4 w-4 mr-2" />
            Export Comptable
          </Button>
          <Button onClick={fetchInvoices} variant="outline" className="border-[#D4AF37]">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#D4AF37]" />
              Factures
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Aucune facture trouvée</p>
              <p className="text-sm mt-1">Les factures sont générées automatiquement lors du paiement</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b text-gray-500 font-medium">
                  <tr>
                    <th className="p-4">N° Facture</th>
                    <th className="p-4">N° Commande</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">HT</th>
                    <th className="p-4">TVA</th>
                    <th className="p-4">TTC</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-[#D4AF37]">{inv.invoice_number}</td>
                      <td className="p-4 text-gray-600">#{inv.order?.order_number || '—'}</td>
                      <td className="p-4 text-gray-600">
                        {format(new Date(inv.issued_at || inv.created_at), 'd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="p-4">{getCustomerName(inv)}</td>
                      <td className="p-4">{Number(inv.subtotal).toFixed(2)} €</td>
                      <td className="p-4 text-gray-500">{Number(inv.tax_amount).toFixed(2)} €</td>
                      <td className="p-4 font-bold text-[#D4AF37]">{Number(inv.total).toFixed(2)} €</td>
                      <td className="p-4">
                        <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'}
                          className={inv.status === 'paid' ? 'bg-green-500' : ''}>
                          {inv.status === 'paid' ? 'Payée' : inv.status === 'issued' ? 'Émise' : inv.status}
                        </Badge>
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(inv)} title="Télécharger PDF">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSendEmail(inv)}
                          disabled={sendingId === inv.id}
                          className="bg-[#D4AF37] hover:bg-[#b8933d] text-white"
                        >
                          {sendingId === inv.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
