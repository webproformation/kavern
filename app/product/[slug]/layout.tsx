import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url, regular_price, sale_price')
    .eq('slug', decodedSlug)
    .maybeSingle();

  if (!product) {
    return { title: 'Produit introuvable | KAVERN' };
  }

  const price = product.sale_price || product.regular_price;
  const title = `${product.name} | KAVERN`;
  const description = product.description
    ? product.description.replace(/<[^>]*>/g, '').substring(0, 160)
    : `Découvrez ${product.name} sur KAVERN — L'Artisanat et l'Inattendu`;

  return {
    title,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.image_url ? [{ url: product.image_url, width: 1200, height: 630 }] : [],
      type: 'website',
      siteName: 'KAVERN',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
