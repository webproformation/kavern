"use client";

import { useEffect } from "react";
import { useProductsStore } from "@/stores/products-store";
import ProductsTable from "./products-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, RefreshCw, Download } from "lucide-react";

export default function ProductsClientWrapper() {
  const { products, categories, loading, error, fetchProducts, fetchCategories } = useProductsStore();

  const exportInventoryCSV = () => {
    const rows: string[] = ['Nom;Variante;UGS;Quantite;Prix Vente TTC;Prix HT;TVA %;Prix Achat HT'];
    products.forEach((p: any) => {
      const tvaRate = p.tva_rate || 20;
      if (p.product_variations?.length > 0) {
        p.product_variations.forEach((v: any) => {
          const varLabel = Object.entries(v.attributes || {}).map(([k, val]: any) => `${val?.name || val}`).join(' / ');
          const ttc = v.sale_price || v.regular_price || p.sale_price || p.regular_price || 0;
          const ht = (ttc / (1 + tvaRate / 100)).toFixed(2);
          rows.push(`"${p.name}";"${varLabel}";"${v.sku || ''}";"${v.stock_quantity ?? ''}";"${ttc}";"${ht}";"${tvaRate}";"${p.purchase_price || ''}"`);
        });
      } else {
        const ttc = p.sale_price || p.regular_price || 0;
        const ht = (ttc / (1 + tvaRate / 100)).toFixed(2);
        rows.push(`"${p.name}";"";"${p.sku || ''}";"${p.stock_quantity ?? ''}";"${ttc}";"${ht}";"${tvaRate}";"${p.purchase_price || ''}"`);
      }
    });
    const blob = new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventaire-kavern-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erreur: {error}</p>
        <Button
          onClick={() => fetchProducts()}
          className="mt-2"
          variant="outline"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      {/* Header - Responsive */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Produits</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
            Gérez vos produits ({products.length} produits)
          </p>
        </div>
        <div className="hidden md:flex gap-2">
          <Button
            onClick={exportInventoryCSV}
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => fetchProducts()}
            variant="outline"
            className="border-gray-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Link href="/admin/products/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Button>
          </Link>
        </div>
      </div>

      <ProductsTable products={products} categories={categories} />

      {/* Floating Action Buttons - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg z-40 flex gap-2">
        <Button
          onClick={exportInventoryCSV}
          variant="outline"
          className="h-12 border-green-300 text-green-700 px-3"
        >
          <Download className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => fetchProducts()}
          variant="outline"
          className="h-12 border-gray-300 px-3"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
        <Link href="/admin/products/new" className="flex-1">
          <Button className="bg-blue-600 hover:bg-blue-700 w-full h-12">
            <Plus className="h-5 w-5 mr-2" />
            Ajouter
          </Button>
        </Link>
      </div>
    </div>
  );
}
