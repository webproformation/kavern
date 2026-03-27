# CODEBASE — KAVERN E-commerce

> Stack : Next.js 14 App Router + Supabase + Stripe + PayPal + Vercel
> Client : KAVERN (ex-La Boutique de Morgane)
> 33 routes app, 86 composants, 38 pages admin, 17 routes API

---

## Architecture

### Frontend
- **Next.js 14** App Router — Server et Client Components
- **Tailwind CSS** + **shadcn/ui** (Radix) + **Lucide icons**
- **Embla Carousel** pour galeries produits
- **Zustand** pour state global (auth-store, cart synced localStorage)
- **React Context** pour Auth, Cart, Wishlist
- **Sonner** pour les toasts
- **jsPDF + jszip** pour generation factures

### Backend (Supabase)
- **PostgreSQL 17** — 93+ tables schema public
- **Supabase Auth** — email/password, sessions cookies
- **Supabase Storage** — bucket `media` (1021+ fichiers)
- **Supabase Realtime** — live chat, emotions
- **RLS** (Row Level Security) sur certaines tables

### Paiement
- **Stripe** — paiement carte (PaymentIntent + webhook)
- **PayPal** — boutons PayPal SDK
- **Wallet interne** — credits magasin

### Deploiement
- **Vercel** — hosting frontend
- **Supabase Cloud** — DB + Auth + Storage + Functions
- **o2switch** — SMTP emails (mail.laboutiquedemorgane.com → A MIGRER)

---

## Tables principales (93 tables)

### Produits
- `products` — 262 produits, IDs UUID
- `product_variations` — 170 variantes (couleur, parfum, taille)
- `product_attributes` — attributs (Couleur, Parfum, Pierre)
- `product_attribute_terms` — valeurs + color_code
- `product_category_mapping` — liaison produit ↔ categorie
- `categories` — 31 categories hierarchiques
- `featured_products` — produits mis en avant

### Commandes
- `orders` — commandes (0 pour l'instant, nouveau KBIS)
- `order_items` — lignes de commande
- `cart_items` — panier persistant (synced Supabase)
- `invoices` — factures generees

### Utilisateurs
- `profiles` — 2 profils (admin + test)
- `addresses` — adresses de livraison
- `user_roles` — roles (admin, customer)
- `user_sessions` — sessions analytics

### Fidelite & Jeux
- `loyalty_points` — points fidelite
- `loyalty_euro_transactions` — euros fidelite
- `wallet_credits` — credits magasin
- `gift_cards` + `gift_card_transactions` — cartes cadeaux
- `wheel_games` + `wheel_game_prizes` — roue de la fortune
- `scratch_card_games` + `scratch_game_prizes` — jeux a gratter
- `card_flip_games` + `card_flip_items` — jeu de cartes

### Livraison
- `shipping_rates` — tarifs par poids
- `shipping_methods` — Mondial Relay, GLS, Chronopost
- `shipments` — expeditions
- `delivery_batches` — lots d'expedition

### Contenu
- `news_posts` + `news_categories` — blog/actualites
- `looks` + `look_products` — looks de Morgane
- `livre_dor` — livre d'or client
- `home_slides` — slides homepage
- `home_categories` — categories homepage
- `site_settings` — configuration globale
- `seo_metadata` + `pages_seo` — SEO par page

### Live Shopping
- `live_streams` — sessions live
- `live_chat_messages` — chat en direct
- `live_viewers` — spectateurs
- `live_emotions` — reactions
- `live_chapters` — chapitres replay
- `live_shared_products` — produits partages en live
- `live_stream_analytics` — stats

### Héritage WooCommerce (A NETTOYER)
- `woocommerce_cache` — ancien cache WP
- `woocommerce_categories_cache` — ancien cache categories
- `livre-dor` — doublon de `livre_dor` (tiret vs underscore)
- `wishlist` vs `wishlists` + `wishlist_items` — doublons

---

## Conventions

- IDs produits en **UUID** (migration depuis format WordPress TEXT "571", "102")
- Images stockees dans **Supabase Storage bucket `media`**
- URLs images : `https://dckbrlxqmgfzaacxqiio.supabase.co/storage/v1/object/public/media/...`
- Auth via **Supabase Auth** — cookies httpOnly
- Callback auth : `/auth/callback` (route.ts)
- Prix en **centimes pour Stripe**, en **euros pour l'affichage**
- TVA configurable par produit (20%, 10%, 5.5%, 0%)
- Variantes : stock = **somme des stock_quantity des variantes**
- Detection couleur : uniquement si nom attribut contient "couleur"/"color"/"pierre"/"nuance"
- Statuts produit : `draft`, `publish`, `private_live`

---

## Points d'attention

- **SMTP** encore sur laboutiquedemorgane.com → migrer vers kavern
- **Tables doublons** WooCommerce → a nettoyer apres migration
- **is_variable_product** pas toujours a jour → utiliser product_variations.length
- **RLS Supabase** → verifier que toutes les tables critiques sont protegees
- **Pas de decrementation de stock automatique** apres commande → A IMPLEMENTER
- **localStorage auth** peut echouer en Safari private mode
- **Pas de tests automatises** — tout est teste manuellement

---

## Etat au 26/03/2026

- 116 pages, build 0 erreurs, 0 console.log
- 90 tables DB (3 WooCommerce supprimees)
- 44 produits is_variable_product corriges
- Colonne tva_rate ajoutee (4 taux)
- Rebranding complet KAVERN (zero ref Morgane/LBDM/DEWANIN)
- Infos legales Kbis completes (SIRET, TVA, APE, IBAN)
- Securite : admin guard, stock trigger variantes, PayPal DB, Stripe webhook
- Migration RLS creee (prete a appliquer sur Supabase prod)
- Cartes cadeaux integrees au checkout
- Chronopost parsing implemente
