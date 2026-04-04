# TACHES RESTANTES — KAVERN

> Mise a jour le 04/04/2026 — KAVERN TERMINÉ ✅ Zéro dette technique restante.

---

## FIXE SESSION 04/04/2026 — Dette technique finale

- [x] `app/api/auth/check-birthday/route.ts` : createRouteHandlerClient → createServerClient (@supabase/ssr)
- [x] `app/api/sendcloud/push/route.ts` : createRouteHandlerClient → createServerClient (@supabase/ssr)
- [x] `app/api/create-payment-intent/route.ts` : apiVersion '2023-10-16' → '2025-12-15.clover'

---

## A FAIRE MAINTENANT (Greg)

- [x] Executer `20260401_fix_pages_seo_and_live_rls.sql` sur Supabase SQL Editor — FAIT 02/04/2026
- [x] Ajouter `INTERNAL_API_SECRET` dans Vercel env vars — FAIT (il y a 2j)
- [x] Ajouter `SENDCLOUD_WEBHOOK_SECRET` dans Vercel env vars — FAIT (il y a 2j)
- [x] Executer le SQL `20260331_final_cleanup.sql` sur Supabase — FAIT 02/04/2026
- [x] SMTP o2switch — résolu par André
- [x] Stripe et PayPal — testés et fonctionnels (confirmé André)

## FIXE SESSION 02/04/2026 — BUGS ANDRÉ + FAVICON

- [x] Pack/Lot: isOutOfStock ignorait is_pack → affichait "En rupture" pour les packs
- [x] Pack/Lot: ProductCard sans check is_pack → ajoutait coffret vide au panier
- [x] Pack/Lot: RefreshCw non importé → crash error boundary sur toute fiche produit pack
- [x] Card Flip: titre "Grand jeu de Janvier !" hardcodé → remplacé par game.name / game.description
- [x] Coupons -0.00€: useUserCoupons utilisait coupons(*) au lieu de coupon:coupons(*) → alias corrigé
- [x] Roue: segment.color vide → fallback sur wheel_design.wheelColors ajouté
- [x] Pages SEO: app/page.tsx ne fetchait pas pages_seo → fetch server-side ajouté (avec try/catch)
- [x] SQL: order_items.product_id ajouté en prod Supabase (TEXT, FK products.id)
- [x] Favicon: app/icon.svg affichait "M" (Morgane) → supprimé, public/favicon.ico (logo KAVERN) utilisé
- [x] OG: url sans www. corrigé + dimensions 800x400 → 1200x630

---

## FIXE SESSION 31/03/2026 — PHASE 1 CRITIQUES (commit d6f3c00)

- [x] SUPPRIME /api/debug/send-test-email (open email relay en prod)
- [x] Auth Bearer + ownership sur paypal/capture-order
- [x] Auth Bearer + userId token sur create-payment-intent
- [x] Auth Bearer + ownership sur paypal/create-order
- [x] Webhook Sendcloud: verification signature HMAC (timingSafeEqual)
- [x] Fix crash .toFixed() sur null (product/[slug]/page.tsx)
- [x] Error boundaries: app/error.tsx + product/[slug]/error.tsx
- [x] Fix TVA NaN checkout (parseFloat sur string prix)
- [x] Callers frontend: Bearer token sur Stripe + PayPal
- [x] SQL: Sequence order_number_seq + trigger generate_order_number()
- [x] SQL: ALTER TABLE order_items ADD COLUMN product_id
- [x] SQL: RLS admin-only media_library, product_variations, product_images
- [x] SQL: RLS admin check news_posts, return_requests, referral_uses
- [x] Backup DB schema + data avant deploy

## FIXE SESSION 31/03/2026 — PHASE 2 HIGH (commit 797d5b0)

- [x] Auth /api/emails/* (7 routes): secret interne ou Bearer
- [x] Auth /api/storage/upload: Bearer requis
- [x] Auth /api/orders/generate-pdf: Bearer + IDOR ownership check
- [x] Fix /api/orders/send-email: auth bypass supprime
- [x] Fix XML injection chronopost + mondial-relay (sanitize + validation CP)
- [x] Fix userId stripe/create-checkout-session: derive du token
- [x] Fix ProductCard.tsx .toFixed() sur string
- [x] Fix ShareButtons double-prefix origin
- [x] Fix confirmation page: Promise [object Promise] -> useState
- [x] Fix PayPal skip post-order tasks (wallet, loyalty, coupon, email)
- [x] Fix Stripe wallet debit timing (dans onSuccess apres paiement)
- [x] Fix gift card race condition (RPC atomique debit_gift_card)
- [x] Fix games claim-reward: tirage cote serveur
- [x] SQL: user_coupons UPDATE policy
- [x] SQL: safe_uuid_cast() pour TEXT vs UUID
- [x] SQL: Tables fantomes creees (referral_codes, newsletter_subscriptions, push_subscriptions, site_settings)
- [x] SQL: profiles admin SELECT/UPDATE policy
- [x] SQL: RPC debit_gift_card() atomique

## FIXE SESSION 31/03/2026 — PHASE 3 MEDIUM + PHASE 4 LOW (commit en cours)

- [x] Rate limiting /api/contact (5 req/h par IP)
- [x] Sanitize error messages (15 routes: plus de error.message au client)
- [x] Fix CheckoutSummary: affiche prix variation
- [x] Fix confirmation page IDOR: auth check user_id
- [x] Fix wallet/coupon: wallet plus disabled par coupon
- [x] Fix cashback: calcule sur total paye (pas subtotal)
- [x] Fix bulk actions admin: cashback auto + shipped_at + paid_at
- [x] Fix shipping_cost_paid: type number (etait boolean dans 3 interfaces)
- [x] Fix delai colis ouvert: 7j dans code (etait 5j)
- [x] Fix TVA hardcodee 20% sur confirmation page
- [x] Fix facture PDF: prix variation pris en compte
- [x] Fix storage: whitelist buckets + sanitize folder (path traversal)
- [x] Fix cart merge login: Math.max au lieu de +=

---

## DEJA FIXE LE 31/03/2026 (session precedente)

### SQL (applique en live sur Supabase) :
- [x] handle_new_user trigger corrige (blocked -> is_blocked)
- [x] Profil Andre cree avec 5EUR bienvenue
- [x] Cashback 2% trigger cree (apply_order_cashback)
- [x] Stock manage_stock active sur tous les produits
- [x] RLS profiles + loyalty pour users normaux
- [x] Shop to Shop provider = chronopost
- [x] payment_status CHECK constraint elargi (pending_transfer, pending_store)
- [x] tax_breakdown colonne ajoutee sur orders

### Code (2 commits pushes sur GitHub -> Vercel) :
- [x] Stripe create-checkout-session: validation prix server-side
- [x] create-payment-intent: auth + prix force depuis DB
- [x] Contact form: XSS escape HTML + validation inputs
- [x] CRON: enforcement secret Bearer sur 4 routes
- [x] Middleware: protection admin routes
- [x] Upload: whitelist MIME + crypto.randomUUID filename
- [x] Credentials admin retires des tests -> env vars
- [x] CartContext: charge tva_rate depuis products au reload panier
- [x] Email facture: contact@kavern-france.fr
- [x] 12-security.spec.ts: 10 tests securite
- [x] 13-smoke-tests.spec.ts: 14 tests sante

---

## FIXE SESSION 01/04/2026 (soir) — AUDIT QA AUTOMATISE

Audit automatise complet : 97 tests E2E Playwright sur kavern-france.fr
Score avant corrections : 67/100 (perf 100, secu 100, SEO 33, a11y 2)

### SEO (corrige)
- [x] Meta descriptions uniques sur 10 pages (accueil, contact, qui-sommes-nous, actualites, livre-dor, live, carte-cadeau, CGV, mentions, confidentialite, retours)
- [x] H1 sur la page d'accueil (sr-only pour garder le design slider)
- [x] Canonical URLs automatiques sur toutes les pages (via layout racine)
- [x] OG + Twitter cards enrichies (description plus complete)
- [x] metadataBase corrige (www.kavern-france.fr au lieu de kavern-france.fr)
- [x] Title template '%s | KAVERN' pour les pages enfants

### Accessibilite (corrige)
- [x] aria-label sur le champ newsletter du footer
- [x] Labels login/register/contact : deja en place (confirme par audit)

### Ce qui allait deja bien
- Performance : 100/100
- Securite : 100/100
- Bonnes pratiques : 100/100
- Toutes les 28 pages publiques en 200 OK
- 13 pages admin OK
- 9 pages compte utilisateur OK
- Formulaire contact complet avec labels
- Pas d'erreurs JavaScript
- Pas d'images cassees
- Responsive mobile OK

---

## ANDRE — STATUT

- Email facture : FIXE (deploye)
- Email o2switch : probleme hebergeur, a verifier par Andre dans cpanel
- Live YouTube : FIXE (admin + embed + live Andre insere en DB)
- Config SMTP Outlook : serveur mail.kavern-france.fr port 993/465
- Livre d'or : FIXE (prenom auto, commandes eligibles, cashback auto)
- TVA 5.5% facture : FIXE (tva_rate stocke dans order_items)
- Colis ouvert : FIXE (insert corrige, delai 7j)

## FIXE SESSION 31/03/2026 — PHASE 5 + CLEANUP FINAL (commit 8a13e31+)

- [x] TVA multi-taux: tva_rate dans order_items + facture PDF
- [x] Colis ouvert: retrait is_paid inexistant de l'insert
- [x] Admin lives: champs playback_url + replay_url
- [x] Livre d'or refonte: prenom auto + commandes eligibles + cashback
- [x] SQL: Cascade delete orders -> order_items
- [x] SQL: Nettoyage 17 tables orphelines
- [x] SQL: Insert live YouTube Andre (BoxnRX8X_DY)
