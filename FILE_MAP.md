# FILE_MAP — KAVERN E-commerce

> 33 routes app | 86 composants | 38 pages admin | 17 routes API

---

## Pages publiques (app/)

| Route | Fichier | Role |
|---|---|---|
| `/` | page.tsx | Homepage (slider, categories, produits vedettes) |
| `/shop` | shop/page.tsx | Boutique avec filtres, tri, pagination |
| `/product/[slug]` | product/[slug]/page.tsx | Fiche produit (galerie, variantes, panier, avis) |
| `/cart` | cart/page.tsx | Panier avec totaux, coupons, wallet |
| `/checkout` | checkout/page.tsx | Tunnel commande (adresse, livraison, paiement) |
| `/order-confirmation` | order-confirmation/page.tsx | Confirmation commande |
| `/wishlist` | wishlist/page.tsx | Liste de souhaits |
| `/live` | live/page.tsx | Live shopping + replay |
| `/carte-cadeau` | carte-cadeau/page.tsx | Cartes cadeaux |
| `/livre-dor` | livre-dor/page.tsx | Livre d'or client |
| `/colis-ouvert` | colis-ouvert/page.tsx | Colis ouverts |
| `/les-looks-de-morgane` | les-looks-de-morgane/page.tsx | Looks complets |
| `/actualites` | actualites/page.tsx | Blog/actus |
| `/contact` | contact/page.tsx | Formulaire contact |
| `/qui-sommes-nous` | qui-sommes-nous/page.tsx | A propos |
| `/categorie/[slug]` | categorie/[slug]/page.tsx | Page categorie |
| `/allo-andre` | allo-andre/page.tsx | Page speciale |

## Auth (app/auth/)

| Route | Role |
|---|---|
| `/auth/login` | Connexion (Suspense wrapper) |
| `/auth/register` | Inscription |
| `/auth/callback` | Callback Supabase (email verif, reset) |
| `/auth/forgot-password` | Mot de passe oublie |
| `/auth/reset-password` | Reset mot de passe |

## Compte client (app/account/)

| Route | Role |
|---|---|
| `/account` | Dashboard compte (profil, avatar, adresses) |

## Admin (app/admin/) — 38 pages

| Route | Role |
|---|---|
| `/admin` | Dashboard admin (stats, revenus, commandes) |
| `/admin/products` | Liste produits (filtres, bulk actions, checkbox) |
| `/admin/products/new` | Creation produit (TVA, packs, variantes) |
| `/admin/products/[id]` | Edition produit |
| `/admin/orders` | Gestion commandes |
| `/admin/categories-management` | Categories hierarchiques |
| `/admin/product-attributes` | Attributs + couleurs (swatches) |
| `/admin/clients` | Gestion clients |
| `/admin/coupons` | Coupons et remises |
| `/admin/gift-cards` | Cartes cadeaux |
| `/admin/expeditions` | Expeditions et lots |
| `/admin/shipping-methods` | Methodes de livraison |
| `/admin/invoices` | Factures |
| `/admin/reviews` | Avis clients |
| `/admin/guestbook` | Livre d'or moderation |
| `/admin/lives` | Gestion lives |
| `/admin/actualites` | Blog/actus |
| `/admin/looks-management` | Looks |
| `/admin/media` | Mediatheque |
| `/admin/slides` | Slides homepage |
| `/admin/home-categories` | Categories homepage |
| `/admin/featured-products` | Produits mis en avant |
| `/admin/loyalty` | Programme fidelite |
| `/admin/wheel` | Roue de la fortune |
| `/admin/scratch-cards` | Jeux a gratter |
| `/admin/card-flip` | Jeu de cartes |
| `/admin/open-packages` | Colis ouverts |
| `/admin/returns-management` | Retours |
| `/admin/store-credits` | Credits magasin |
| `/admin/settings` | Parametres site |
| `/admin/site-pages` | Pages SEO |
| `/admin/payment-methods` | Moyens de paiement |
| `/admin/ambassador` | Programme ambassadeur |
| `/admin/sauvegarde` | Sauvegarde DB |

## Routes API (app/api/)

| Route | Role |
|---|---|
| `/api/stripe` | Webhooks Stripe |
| `/api/paypal` | Webhooks PayPal |
| `/api/create-payment-intent` | Creation intention Stripe |
| `/api/orders` | CRUD commandes |
| `/api/invoices` | Generation factures PDF |
| `/api/send-email` | Envoi emails SMTP |
| `/api/emails` | Templates emails |
| `/api/contact` | Formulaire contact |
| `/api/storage` | Proxy Supabase Storage |
| `/api/live` | Live streaming |
| `/api/games` | Jeux (roue, grattage, cartes) |
| `/api/mondial-relay` | Points relais MR |
| `/api/gls` | Points relais GLS |
| `/api/chronopost` | Suivi Chronopost |
| `/api/cron` | Taches planifiees |
| `/api/webhooks` | Webhooks generiques |
| `/api/debug` | Debug (dev only) |

## Composants principaux (components/)

| Composant | Role |
|---|---|
| site-header.tsx | Header : nav, recherche, panier, compte |
| site-footer.tsx | Footer : liens, categories, legal |
| mobile-menu.tsx | Menu hamburger mobile |
| layout-wrapper.tsx | Providers (Auth, Cart, Wishlist, Toaster) |
| ProductCard.tsx | Card produit (galerie, prix, variantes, panier) |
| ProductGallery.tsx | Galerie images produit (Embla, zoom, video) |
| ProductVariationSelector.tsx | Selecteur variantes (couleurs pastilles, dropdown texte) |
| ProductVariationsManager.tsx | Admin : gestion variantes |
| VariationDetailsForm.tsx | Admin : details par variante |
| ProductFilters.tsx | Filtres boutique (categories, prix, tri) |
| search-modal.tsx | Modal recherche produit |
| profile-picture-upload.tsx | Upload avatar → Supabase Storage |
| PasswordInput.tsx | Input mot de passe avec toggle oeil |
| RichTextEditor.tsx | Editeur WYSIWYG (description produit) |
| HiddenDiamond.tsx | Diamant cache sur produits |
| HiddenDiamondDetector.tsx | Detection diamant avec message guest |
| AppLifecycle.tsx | Refresh session au retour mobile |
| CookieConsent.tsx | Banniere cookies RGPD |
| StripePaymentForm.tsx | Formulaire paiement Stripe Elements |
| PayPalButtons.tsx | Boutons PayPal SDK |
| WalletSelector.tsx | Selection credits wallet |
| CouponSelector.tsx | Application coupon |
| MondialRelaySelector.tsx | Selection point relais MR |
| RelayPointSelector.tsx | Selection point relais GLS |
| FloatingButtons.tsx | Boutons flottants (chat, scroll top) |
| hero-slider.tsx | Slider homepage |
| home-categories.tsx | Categories homepage |
| featured-products.tsx | Produits vedettes |
| LiveChat.tsx | Chat en direct live |
| LiveVideoPlayer.tsx | Lecteur video live |
| DashboardStats.tsx | Stats admin dashboard |
| MediaLibrary.tsx | Mediatheque admin |
| SeoMetadataEditor.tsx | Editeur SEO par page |
| AdminInvoiceGenerator.tsx | Generateur factures admin |

## Contextes (context/)

| Fichier | Role |
|---|---|
| AuthContext.tsx | Auth Supabase (login, register, signOut, profile) |
| CartContext.tsx | Panier (add, remove, update, stock validation) |
| WishlistContext.tsx | Liste de souhaits |

## Stores Zustand (stores/)

| Fichier | Role |
|---|---|
| auth-store.ts | State auth global (doublon AuthContext) |

## Config

| Fichier | Role |
|---|---|
| middleware.ts | Update session Supabase sur chaque requete |
| lib/supabase.ts | Client Supabase (anon + service_role) |
| lib/supabase-middleware.ts | Middleware helper |
| utils/supabase/server.ts | Client Supabase SSR |
| utils/supabase/middleware.ts | Middleware SSR |
| tailwind.config.ts | Config Tailwind (marquee animation) |
| next.config.js | Config Next.js |
| vercel.json | Config Vercel |
