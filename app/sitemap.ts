// app/sitemap.ts
import { createClient } from '@supabase/supabase-js';
import { MetadataRoute } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kavern-france.fr';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Pages statiques
  const staticPages = [
    '', '/shop', '/live', '/carte-cadeau', '/livre-dor', '/colis-ouvert',
    '/contact', '/qui-sommes-nous', '/allo-andre',
    '/cgv', '/mentions-legales', '/politique-confidentialite',
    '/frais-de-port', '/vite-chez-vous', '/le-droit-a-lerreur',
    '/transactions-protegees', '/actualites', '/wishlist',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1 : route === '/shop' ? 0.9 : 0.7,
  }));

  // Produits
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('status', 'publish');

  const productPages = (products || []).map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at');

  const categoryPages = (categories || []).map((c) => ({
    url: `${baseUrl}/categorie/${c.slug}`,
    lastModified: new Date(c.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Articles actualites
  const { data: posts } = await supabase
    .from('news_posts')
    .select('slug, updated_at')
    .eq('published', true);

  const postPages = (posts || []).map((p) => ({
    url: `${baseUrl}/actualites/${p.slug}`,
    lastModified: new Date(p.updated_at || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...postPages];
}
