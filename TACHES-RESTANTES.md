# TACHES RESTANTES — KAVERN

> Mise a jour le 31/03/2026 — AUDIT DIVINE 64 problemes : **TOUS FIXES (Phases 1-4)**

---

## RESTE A FAIRE

- [ ] Nettoyer 20+ tables orphelines en DB
- [ ] Admin delete order: cascade vers order_items (SQL constraint)
- [ ] Livre d'or : refonte formulaire securise (demande Andre 31/03)
  - Formulaire visible uniquement si connecte
  - Prenom auto-complete depuis profil (non modifiable)
  - Menu deroulant commandes eligibles (statut livre/terminee, pas encore notee)
  - Attribution cashback 0.20EUR auto a la validation admin
- [ ] Ajouter INTERNAL_API_SECRET dans Vercel env vars
- [ ] Ajouter SENDCLOUD_WEBHOOK_SECRET dans Vercel env vars

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

## ANDRE — EN ATTENTE DE REPONSE

- Email facture : FIXE (deploye)
- Email o2switch : probleme hebergeur, verifier cpanel
- Live YouTube : integrer embed non repertorie
- Config SMTP Outlook : serveur mail.kavern-france.fr port 993/465
- **Livre d'or** : refonte demandee le 31/03 (voir section "Reste a faire")
