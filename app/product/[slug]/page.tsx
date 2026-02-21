"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { HiddenDiamond } from "@/components/HiddenDiamond";

export default function ProductPage() {
  const { slug } = useParams(); // On utilise SLUG et non ID
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      supabase.from("products").select("*").eq("slug", slug).maybeSingle()
        .then(({ data }) => {
          setProduct(data);
          setLoading(false);
        });
    }
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!product) return <div className="p-20 text-center font-bold">Cette pépite n'existe plus...</div>;

  return (
    <main className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-black uppercase mb-4">{product.name}</h1>
      <div className="aspect-square max-w-md mb-8"><img src={product.image_url} className="rounded-3xl" /></div>
      <div className="prose mb-10" dangerouslySetInnerHTML={{ __html: product.description }} />
      
      {/* DIAMANT CACHÉ */}
      <HiddenDiamond productId={product.id} position="description" selectedPosition="description" />
    </main>
  );
}