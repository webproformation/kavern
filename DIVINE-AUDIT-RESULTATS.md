# KAVERN — AUDIT DIVINE COMPLET (31 mars 2026)

## 64 problemes identifies — 12 CRITIQUES, 22 HIGH, 19 MEDIUM, 11 LOW

---

## PHASE 1 — CRITIQUES (a fixer EN PREMIER)

### SECU-01: CRITICAL — /api/debug/send-test-email = OPEN EMAIL RELAY
- **Fichier:** app/api/debug/send-test-email/route.ts
- **Probleme:** Zero auth, n'importe qui peut envoyer des emails depuis le SMTP KAVERN
- **Fix:** SUPPRIMER ce fichier ou ajouter admin-only + NODE_ENV check

### SECU-02: CRITICAL — /api/paypal/capture-order sans auth
- **Fichier:** app/api/paypal/capture-order/route.ts, ligne 23-65
- **Probleme:** N'importe qui peut marquer une commande comme payee
- **Fix:** Ajouter auth + verification ownership + verification montant PayPal

### SECU-03: CRITICAL — /api/create-payment-intent manipulation prix (sans orderId)
- **Fichier:** app/api/create-payment-intent/route.ts, lignes 14-51
- **Probleme:** Sans orderId, le client envoie le montant qu'il veut (1 centime)
- **Fix:** TOUJOURS exiger orderId, verifier total server-side

### SECU-04: CRITICAL — /api/paypal/create-order manipulation prix (sans orderId)
- **Fichier:** app/api/paypal/create-order/route.ts, lignes 43-68
- **Fix:** TOUJOURS exiger orderId

### SECU-05: CRITICAL — Webhook Sendcloud sans signature
- **Fichier:** app/api/webhooks/sendcloud/route.ts, lignes 4-36
- **Fix:** Verifier x-sendcloud-signature avec HMAC-SHA256

### CRASH-01: CRITICAL — Page produit crash en prod
- **Fichier:** app/product/[slug]/page.tsx, LIGNE 596
- **Probleme:** `(rel.sale_price || rel.regular_price).toFixed(2)` sur null = crash
- **Fix:** `(Number(rel.sale_price || rel.regular_price) || 0).toFixed(2)`

### CRASH-02: CRITICAL — Aucun error boundary (error.tsx)
- **Probleme:** 0 fichiers error.tsx dans tout le projet = ecran blanc sur toute erreur
- **Fix:** Creer app/error.tsx + app/product/[slug]/error.tsx

### DB-01: CRITICAL — order_items manque colonne product_id
- **Probleme:** Le trigger decrement_order_stock lit oi.product_id qui N'EXISTE PAS
- **Fix:** ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id text

### DB-02: CRITICAL — RLS grand ouvert sur media_library, product_variations, product_images
- **Probleme:** TO public USING(true) = N'IMPORTE QUI peut modifier
- **Fix:** Remplacer par admin-only policies

### DB-03: CRITICAL — RLS grand ouvert sur news_posts, return_requests, referral_uses
- **Probleme:** TO authenticated USING(true) = tout user connecte peut tout modifier
- **Fix:** Ajouter check is_admin

### FLOW-01: CRITICAL — Order number race condition (CMD doublons possibles)
- **Fichier:** app/checkout/page.tsx, lignes 25-34
- **Fix:** Utiliser sequence Postgres ou UNIQUE constraint + retry

### FLOW-02: CRITICAL — TVA calculation NaN (string * number)
- **Fichier:** app/checkout/page.tsx, ligne 211
- **Probleme:** item.price est string, multiplication donne NaN avec virgule
- **Fix:** parseFloat(String(item.price).replace(',', '.'))

---

## PHASE 2 — HIGH (cette semaine)

### SECU-06: HIGH — 7 routes /api/emails/* sans aucune auth
- **Fix:** Ajouter secret interne X-Internal-Secret

### SECU-07: HIGH — /api/storage/upload sans auth
- **Fix:** Exiger session user

### SECU-08: HIGH — /api/orders/generate-pdf sans auth (IDOR)
- **Fix:** Auth + verification ownership

### SECU-09: HIGH — /api/orders/send-email auth optionnelle (bypassable)
- **Fix:** Exiger auth OU secret interne

### SECU-10: HIGH — /api/chronopost/search injection XML
- **Fix:** Echapper postalCode et city

### SECU-11: HIGH — userId vient du body client (pas de session)
- **Fichiers:** create-payment-intent, stripe/create-checkout-session
- **Fix:** Deriver userId de la session Supabase

### CRASH-03: HIGH — ProductCard.tsx .toFixed() sur string
- **Fichier:** components/ProductCard.tsx, ligne 232
- **Fix:** Number(price) || 0

### CRASH-04: HIGH — ShareButtons double-prefix origin (liens partage casses)
- **Fichier:** app/product/[slug]/page.tsx ligne 338 + ShareButtons.tsx ligne 17
- **Fix:** Passer le path, pas l'URL complete

### DB-04: HIGH — Table 'categories' n'existe pas (code query 'categories', DB a 'product_categories')
- **Fix:** CREATE VIEW categories AS SELECT * FROM product_categories

### DB-05: HIGH — user_coupons manque UPDATE policy (coupons jamais marques utilises)
- **Fix:** CREATE POLICY users can update own coupons

### DB-06: HIGH — user_coupons FK mismatch (join 'coupons' mais FK vers 'coupon_types')
- **Fix:** Corriger le join ou creer la bonne FK

### DB-07: HIGH — 6+ tables fantomes (pas de CREATE TABLE dans migrations)
- referral_codes, newsletter_subscriptions, push_subscriptions, site_settings, loyalty_tiers
- **Fix:** Creer migration pour chaque

### DB-08: HIGH — profiles manque admin SELECT/UPDATE policy
- **Fix:** Ajouter policies admin

### DB-09: HIGH — products.id est TEXT, stock functions cast ::uuid = match jamais
- **Fix:** Retirer ::uuid dans decrement_order_stock() et restore_order_stock()

### FLOW-03: HIGH — Confirmation page render Promise comme texte "[object Promise]"
- **Fichier:** app/checkout/confirmation/page.tsx, ligne 226
- **Fix:** Fetch email dans useEffect, stocker dans state

### FLOW-04: HIGH — PayPal success skip post-order tasks (wallet, loyalty, coupon)
- **Fichier:** app/checkout/page.tsx, handlePayPalSuccess
- **Fix:** Ajouter runPostOrderTasks() dans handlePayPalSuccess

### FLOW-05: HIGH — Stripe debite wallet/loyalty AVANT paiement
- **Fichier:** app/checkout/page.tsx, lignes 621-629
- **Fix:** Deplacer runPostOrderTasks dans le callback onSuccess Stripe

### FLOW-06: HIGH — Gift card race condition (double-spending possible)
- **Fichier:** app/checkout/page.tsx, lignes 514-524
- **Fix:** Utiliser RPC atomique Postgres

### FLOW-07: HIGH — Games claim-reward client controle has_won (non-card-flip)
- **Fichier:** app/api/games/claim-reward/route.ts, lignes 154-158
- **Fix:** Server-side win determination pour tous les jeux

---

## PHASE 3 — MEDIUM (ce mois)

### SECU-12: MEDIUM — Mondial Relay injection XML
### SECU-13: MEDIUM — Contact form pas de rate limiting
### SECU-14: MEDIUM — Error messages leak internals (6 routes)
### SECU-15: MEDIUM — Vercel webhook auth optionnelle
### SECU-16: MEDIUM — Storage upload pas de limite taille
### FLOW-08: MEDIUM — CheckoutSummary affiche prix de base au lieu de variation
### FLOW-09: MEDIUM — Confirmation page pas de auth check (IDOR)
### FLOW-10: MEDIUM — Wallet disabled quand coupon applique (devrait etre independant)
### FLOW-11: MEDIUM — Cashback calcule sur subtotal au lieu de total (sur-credit)
### FLOW-12: MEDIUM — Bulk payment update skip cashback et facture
### FLOW-13: MEDIUM — Bulk status shipped skip email et shipped_at
### FLOW-14: MEDIUM — Open package shipping_cost_paid type mismatch (number vs boolean)
### FLOW-15: MEDIUM — Delai colis ouvert 5j dans code, 7j dans UI
### DB-10: MEDIUM — Duplicate RLS migration names causent erreurs
### DB-11: MEDIUM — shipping_methods manque admin write policies

---

## PHASE 4 — LOW (nice to have)

### FLOW-16: TVA hardcodee 20% sur confirmation page
### FLOW-17: Facture PDF ignore prix variation
### FLOW-18: order_items manque product_id pour analytics
### FLOW-19: Admin delete order pas de cascade
### FLOW-20: Cart merge login double-count quantites
### SECU-17: Storage bucket name client-controlled
### SECU-18: Storage path traversal via folder
### SECU-19: Cron routes leak PII dans reponses
### CRASH-05: description null affiche "null" en texte
### CRASH-06: LiveVideoPlayer .includes() sur null potentiel
### CRASH-07: admin orders order! non-null assertion

---

## CE QUI A ETE FIXE AUJOURD'HUI (31 mars)

### SQL applique sur Supabase :
- handle_new_user trigger (blocked -> is_blocked)
- Profil Andre cree + 5euros
- Cashback 2% trigger cree
- Stock manage_stock active sur tous les produits
- RLS profiles + loyalty pour users normaux
- Shop to Shop = Chronopost
- payment_status CHECK constraint elargi

### Code pushe (2 commits) :
- 7 fixes securite (Stripe validation, XSS contact, CRON enforce, middleware admin, upload MIME)
- CartContext tva_rate reload
- Email facture contact@kavern-france.fr
- 24 nouveaux tests E2E (12-security + 13-smoke-tests)
- Credentials admin retires des tests

### Tests : 22/23 PASS (1 fail = crash produit confirme)
