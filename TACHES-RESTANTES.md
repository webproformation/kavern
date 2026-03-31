# TACHES RESTANTES — KAVERN

> Mise a jour le 31/03/2026 apres AUDIT DIVINE COMPLET (64 problemes trouves)

---

## PRIORITE 1 — CRITIQUES (prochaine session, ~2h)

- [ ] SUPPRIMER /api/debug/send-test-email (OPEN EMAIL RELAY en prod!)
- [ ] Fix /api/paypal/capture-order (zero auth, n'importe qui marque comme paye)
- [ ] Fix /api/create-payment-intent (forcer orderId, verifier total server-side)
- [ ] Fix /api/paypal/create-order (forcer orderId)
- [ ] Fix webhook Sendcloud (ajouter verification signature HMAC)
- [ ] Fix crash produit ligne 596 product/[slug]/page.tsx (.toFixed sur null)
- [ ] Creer app/error.tsx + app/product/[slug]/error.tsx (error boundary)
- [ ] SQL: ALTER TABLE order_items ADD COLUMN product_id text
- [ ] SQL: Fix RLS media_library, product_variations, product_images -> admin-only
- [ ] SQL: Fix RLS news_posts, return_requests, referral_uses -> admin check
- [ ] Fix order number race condition (sequence Postgres ou UNIQUE + retry)
- [ ] Fix TVA NaN dans checkout (parseFloat sur string prix)

## PRIORITE 2 — HIGH (cette semaine, ~3h)

- [ ] Auth sur /api/emails/* (7 routes, ajouter secret interne)
- [ ] Auth sur /api/storage/upload
- [ ] Auth sur /api/orders/generate-pdf (IDOR)
- [ ] Fix /api/orders/send-email auth bypass
- [ ] Fix XML injection /api/chronopost/search et /api/mondial-relay/search
- [ ] Fix userId: deriver de la session Supabase (pas du body client)
- [ ] Fix ProductCard.tsx .toFixed() sur string (ligne 232)
- [ ] Fix ShareButtons double-prefix origin (liens partage casses)
- [ ] SQL: CREATE VIEW categories AS SELECT * FROM product_categories
- [ ] SQL: user_coupons UPDATE policy (coupons jamais marques utilises)
- [ ] SQL: Fix products.id TEXT vs stock functions cast ::uuid
- [ ] SQL: Creer tables fantomes (referral_codes, newsletter_subscriptions, push_subscriptions, site_settings)
- [ ] SQL: profiles admin SELECT/UPDATE policy
- [ ] Fix confirmation page render Promise "[object Promise]"
- [ ] Fix PayPal skip post-order tasks (wallet, loyalty, coupon)
- [ ] Fix Stripe debite wallet AVANT paiement (deplacer dans onSuccess)
- [ ] Fix gift card race condition (RPC atomique Postgres)
- [ ] Fix games claim-reward server-side win (non-card-flip)

## PRIORITE 3 — MEDIUM (ce mois)

- [ ] Rate limiting /api/contact
- [ ] Sanitize error messages (6 routes leakent des internals)
- [ ] Fix CheckoutSummary: affiche prix variation au lieu de base
- [ ] Fix confirmation page: pas de auth check (IDOR)
- [ ] Fix wallet/coupon: wallet ne devrait pas etre disabled par coupon
- [ ] Fix cashback: calculer sur total paye (pas subtotal)
- [ ] Fix bulk actions admin: skip cashback, email, shipped_at, facture
- [ ] Fix open package: shipping_cost_paid type mismatch (number vs boolean)
- [ ] Fix delai colis ouvert: 5j dans code, 7j dans UI — aligner

## PRIORITE 4 — LOW (nice to have)

- [ ] TVA hardcodee 20% sur confirmation page (devrait multi-taux)
- [ ] Facture PDF ignore prix variation
- [ ] order_items: ajouter product_id pour analytics
- [ ] Admin delete order: cascade vers order_items
- [ ] Cart merge login: double-count quantites (Math.max au lieu de +=)
- [ ] Storage: whitelist bucket names
- [ ] Storage: sanitize folder parameter (path traversal)
- [ ] Nettoyer 20+ tables orphelines en DB

---

## DEJA FIXE LE 31/03/2026

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
- [x] create-payment-intent: auth + prix force depuis DB (quand orderId present)
- [x] Contact form: XSS escape HTML + validation inputs
- [x] CRON: enforcement secret Bearer sur 4 routes
- [x] Middleware: protection admin routes (redirect sans session)
- [x] Upload: whitelist MIME + crypto.randomUUID filename
- [x] Credentials admin retires des tests -> env vars
- [x] CartContext: charge tva_rate depuis products au reload panier
- [x] Email facture: contact@kavern-france.fr (etait contact@kavern.fr)
- [x] 12-security.spec.ts: 10 tests securite
- [x] 13-smoke-tests.spec.ts: 14 tests sante

### Tests E2E : 22/23 PASS
- 1 fail = crash page produit confirme en prod (a fixer en priorite 1)

---

## ANDRE — EN ATTENTE DE REPONSE

- Email facture : FIXE (sera effectif au prochain deploy)
- Email o2switch : probleme hebergeur, verifier cpanel
- Live YouTube : integrer embed non repertorie
- Config SMTP Outlook : serveur mail.kavern-france.fr port 993/465
