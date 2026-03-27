/**
 * CRÉATION PRODUIT TEST GLOBAL
 * Projet: qcqbtmvbvipsxwjlgjvk
 *
 * Ce produit contient TOUTES les options possibles :
 * - Tous les champs remplis
 * - Toutes les catégories associées
 * - Variations avec attributs
 * - Métadonnées SEO complètes
 * - Images multiples
 * - Stock géré
 * - Diamant + Featured
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const PRODUCT_ID = 'TEST_PRODUIT_GLOBAL_001';
const PRODUCT_SLUG = 'test-produit-global-001';

console.log('🎯 CRÉATION PRODUIT TEST GLOBAL\n');

async function cleanup() {
  console.log('🧹 Nettoyage...');
  await supabase.from('product_variations').delete().eq('product_id', PRODUCT_ID);
  await supabase.from('product_category_mapping').delete().eq('product_id', PRODUCT_ID);
  await supabase.from('seo_metadata').delete().eq('product_id', PRODUCT_ID);
  await supabase.from('products').delete().eq('id', PRODUCT_ID);
  console.log('✅ Nettoyé\n');
}

async function getAllCategories() {
  const { data } = await supabase
    .from('categories')
    .select('id, name');
  return data || [];
}

async function createProduct() {
  console.log('📦 Création produit...');

  const productData = {
    id: PRODUCT_ID,
    name: 'TEST PRODUIT GLOBAL',
    slug: PRODUCT_SLUG,
    description: `
      <h2>Produit de Test Complet</h2>
      <p>Ce produit contient <strong>toutes les fonctionnalités</strong> disponibles :</p>
      <ul>
        <li>✅ Tous les champs remplis</li>
        <li>✅ Multiple catégories</li>
        <li>✅ Variations avec couleurs et tailles</li>
        <li>✅ Métadonnées SEO complètes</li>
        <li>✅ Images multiples</li>
        <li>✅ Gestion de stock</li>
        <li>✅ Produit diamant</li>
        <li>✅ Produit mis en avant</li>
      </ul>
    `,
    regular_price: 149.99,
    sale_price: 99.99,
    stock_quantity: 500,
    manage_stock: true,
    stock_status: 'instock',
    status: 'publish',
    is_diamond: true,
    is_featured: true,
    image_url: '/kavern-logo.png',
    images: [
      { url: '/kavern-logo.png', alt: 'Image principale TEST' },
      { url: '/kavern-logo.png', alt: 'Image 2 TEST' },
      { url: '/kavern-icone.png', alt: 'Image 3 TEST' },
      { url: '/image.png', alt: 'Image 4 TEST' }
    ]
  };

  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }

  console.log('✅ Produit créé\n');
  return data;
}

async function mapAllCategories() {
  console.log('🔗 Association à TOUTES les catégories...');

  const categories = await getAllCategories();
  const mappings = categories.map(cat => ({
    product_id: PRODUCT_ID,
    category_id: cat.id
  }));

  const { data, error } = await supabase
    .from('product_category_mapping')
    .insert(mappings);

  if (error) {
    console.error('❌ Erreur mappings:', error.message);
    return false;
  }

  console.log(`✅ ${categories.length} catégories associées\n`);
  return true;
}

async function createSeoMetadata() {
  console.log('🎯 Création métadonnées SEO...');

  const seoData = {
    entity_type: 'product',
    entity_identifier: PRODUCT_ID,
    product_id: PRODUCT_ID,
    seo_title: 'TEST PRODUIT GLOBAL - KAVERN',
    meta_description: 'Découvrez le TEST PRODUIT GLOBAL avec toutes les fonctionnalités : variations, stock, images multiples, SEO complet. Le produit parfait pour tester toutes les capacités.',
    og_title: 'TEST PRODUIT GLOBAL - KAVERN',
    og_description: 'Produit de démonstration complet avec toutes les options activées.',
    og_image: '/kavern-logo.png',
    is_active: true
  };

  const { data, error } = await supabase
    .from('seo_metadata')
    .insert([seoData])
    .select()
    .single();

  if (error) {
    console.error('❌ Erreur SEO:', error.message);
    return false;
  }

  console.log('✅ Métadonnées SEO créées\n');
  return true;
}

async function createVariations() {
  console.log('🎨 Création variations...');

  const variations = [
    {
      product_id: PRODUCT_ID,
      sku: 'TEST-GLOBAL-RED-S',
      attributes: { couleur: 'Rouge', taille: 'S' },
      regular_price: 149.99,
      sale_price: 99.99,
      stock_quantity: 50,
      stock_status: 'instock',
      image_url: '/kavern-logo.png',
      is_active: true
    },
    {
      product_id: PRODUCT_ID,
      sku: 'TEST-GLOBAL-RED-M',
      attributes: { couleur: 'Rouge', taille: 'M' },
      regular_price: 149.99,
      sale_price: 99.99,
      stock_quantity: 100,
      stock_status: 'instock',
      image_url: '/kavern-logo.png',
      is_active: true
    },
    {
      product_id: PRODUCT_ID,
      sku: 'TEST-GLOBAL-BLUE-S',
      attributes: { couleur: 'Bleu', taille: 'S' },
      regular_price: 149.99,
      sale_price: 99.99,
      stock_quantity: 75,
      stock_status: 'instock',
      image_url: '/kavern-logo.png',
      is_active: true
    },
    {
      product_id: PRODUCT_ID,
      sku: 'TEST-GLOBAL-BLUE-M',
      attributes: { couleur: 'Bleu', taille: 'M' },
      regular_price: 149.99,
      sale_price: 99.99,
      stock_quantity: 125,
      stock_status: 'instock',
      image_url: '/kavern-logo.png',
      is_active: true
    },
    {
      product_id: PRODUCT_ID,
      sku: 'TEST-GLOBAL-GREEN-L',
      attributes: { couleur: 'Vert', taille: 'L' },
      regular_price: 149.99,
      sale_price: 99.99,
      stock_quantity: 150,
      stock_status: 'instock',
      image_url: '/kavern-icone.png',
      is_active: true
    }
  ];

  const { data, error } = await supabase
    .from('product_variations')
    .insert(variations);

  if (error) {
    console.error('❌ Erreur variations:', error.message);
    return false;
  }

  console.log(`✅ ${variations.length} variations créées\n`);
  return true;
}

async function verify() {
  console.log('🔍 Vérification...\n');

  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      product_category_mapping (
        category_id,
        categories (name)
      )
    `)
    .eq('id', PRODUCT_ID)
    .single();

  const { data: variations } = await supabase
    .from('product_variations')
    .select('*')
    .eq('product_id', PRODUCT_ID);

  const { data: seo } = await supabase
    .from('seo_metadata')
    .select('*')
    .eq('product_id', PRODUCT_ID)
    .maybeSingle();

  console.log('📊 RÉSUMÉ :');
  console.log(`  - Produit: ${product?.name}`);
  console.log(`  - Prix: ${product?.regular_price}€ → ${product?.sale_price}€`);
  console.log(`  - Stock: ${product?.stock_quantity} unités`);
  console.log(`  - Diamant: ${product?.is_diamond ? '✅' : '❌'}`);
  console.log(`  - Featured: ${product?.is_featured ? '✅' : '❌'}`);
  console.log(`  - Catégories: ${product?.product_category_mapping?.length || 0}`);
  console.log(`  - Variations: ${variations?.length || 0}`);
  console.log(`  - SEO: ${seo ? '✅' : '❌'}`);
  console.log('');
}

async function run() {
  await cleanup();

  const product = await createProduct();
  if (!product) return;

  await mapAllCategories();
  await createSeoMetadata();
  await createVariations();
  await verify();

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✅ PRODUIT TEST GLOBAL CRÉÉ AVEC SUCCÈS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`🔗 Accès admin: /admin/products/${PRODUCT_ID}`);
  console.log(`🔗 Accès public: /product/${PRODUCT_SLUG}`);
  console.log('');
}

run();
