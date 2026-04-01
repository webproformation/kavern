# FUTUR — KAVERN E-commerce

> Plan de verification et evolution du site KAVERN
> Mis a jour le 31/03/2026 — APRES AUDIT DIVINE (64 problemes identifies)

---

## Phase 1 — Verification COMPLETE du site (Samedi 29/03/2026)

> TOUT doit etre teste. Chaque page, chaque fonctionnalite, chaque bouton.
> Desktop ET mobile. Aucune exception.

### 1.1 Parcours client complet — bout en bout

| Etape | Quoi tester en detail | Priorite |
|---|---|---|
| **Homepage** | Slider defilant (auto + manual), categories cliquables, produits vedettes, jeux visibles (roue, grattage, cartes), diamants caches, banner marquee, responsive mobile | CRITIQUE |
| **Navigation** | Menu desktop complet (Live, Carte cadeau, Nouveautes, Actu), menu hamburger mobile, mega-menu categories, sous-categories, recherche modale | CRITIQUE |
| **Boutique /shop** | Filtres categorie, filtre prix (slider), tri (prix, nouveaute, populaire), pagination, nombre resultats, affichage grille/liste, reset filtres | CRITIQUE |
| **Fiche produit** | Galerie swipe mobile + fleches desktop, zoom image, video embed (YT/Insta/FB), variantes couleur (pastilles), variantes parfum/taille (dropdown texte), stock par variante, ajout panier, quantite max = stock, produits similaires, avis clients, partage social, description HTML formattee, onglets, breadcrumb | CRITIQUE |
| **Panier /cart** | Ajout/suppression articles, modification quantite (max = stock), coupon (saisie + application + suppression), wallet credits, carte cadeau, sous-total TTC, frais de port estimes, panier vide = message, panier persistant apres refresh | CRITIQUE |
| **Checkout complet** | Adresse livraison (saisie + sauvegardee), choix livraison (Mondial Relay carte Google Maps, GLS points relais carte, Chronopost a domicile), calcul frais port par poids, recapitulatif commande, paiement Stripe (carte test 4242), paiement PayPal (sandbox), paiement wallet, application coupon, application carte cadeau, validation commande, decrementation stock | CRITIQUE |
| **Points relais** | Carte Google Maps Mondial Relay (zoom, marqueurs, selection), carte GLS (idem), adresse pre-remplie, recherche par CP | CRITIQUE |
| **Confirmation commande** | Page recapitulatif, numero commande, email de confirmation envoye, facture PDF generee, lien vers suivi | CRITIQUE |
| **Bons de commande** | Format PDF correct, logo KAVERN, adresses, articles, prix TTC/HT, TVA par taux, total, mention legales | CRITIQUE |
| **Factures** | Generation PDF admin, numero sequentiel, format conforme, TVA, coordonnees client, telechargement | CRITIQUE |

### 1.2 Auth & Compte client

| Fonctionnalite | Quoi tester | Priorite |
|---|---|---|
| **Inscription** | Formulaire complet, validation email, mdp 8 chars, callback email, auto-login | CRITIQUE |
| **Connexion** | Email + mdp, erreur si mauvais, redirect apres login, "Se souvenir" | CRITIQUE |
| **Mot de passe oublie** | Email envoye, lien reset, nouveau mdp, re-connexion | CRITIQUE |
| **Profil** | Prenom, nom, tel, date naissance, modification + sauvegarde | HAUTE |
| **Avatar** | Upload image, affichage, persistance apres refresh | HAUTE |
| **Adresses** | Ajout, modification, suppression, selection au checkout | HAUTE |
| **Historique commandes** | Liste commandes, detail, statut, facture PDF | HAUTE |
| **Fidelite** | Points accumules, euros fidelite, paliers, utilisation au checkout | HAUTE |
| **Wallet** | Solde, historique transactions, utilisation au checkout | HAUTE |
| **Parrainage** | Code parrain, inscription filleul, reward des deux cotes | MOYENNE |
| **Deconnexion** | Bouton, redirect, session detruite | HAUTE |

### 1.3 Admin COMPLET — toutes les fonctionnalites

| Section | Tests detailles | Priorite |
|---|---|---|
| **Dashboard** | Stats (CA, commandes, clients, produits), graphiques, periode, refresh | HAUTE |
| **Produits — liste** | Affichage tous produits, filtres statut (draft/publish/private_live), recherche nom, tri, pagination, bulk select (checkbox), bulk actions (publier/prive live/supprimer), icones actions (edit/delete) | CRITIQUE |
| **Produits — creation** | Tous les champs (nom, slug, SKU, description WYSIWYG, histoire Andre, video), images (principale + galerie), categories hierarchiques, attributs generaux, prix (achat HT, vente TTC, promo, TVA 4 taux, marge auto), stock, poids, statut (draft/publish/private_live), SEO (titre, description), produits lies, variantes (couleurs, nuances, stock par variante), pack/lot (activation, slots, categorie source), diamant cache, mise en avant, auto-save brouillon, clearSavedData apres creation | CRITIQUE |
| **Produits — edition** | Memes champs que creation, chargement donnees existantes, sauvegarde, variantes existantes modifiables, ajout/suppression variante, stock variante | CRITIQUE |
| **Commandes** | Liste avec statuts (en attente, en cours, expediee, livree, annulee), detail commande (articles, quantites, prix, adresse, livraison, paiement), changement statut, generation facture, impression bon de commande, email notification client | CRITIQUE |
| **Categories** | Creation, hierarchie parent/enfant, image, slug, modification, suppression (si pas de produits), ordre d'affichage | HAUTE |
| **Attributs produits** | Familles d'attributs, valeurs, couleurs (swatches avec code hex), ajout/suppression valeurs, association produits | HAUTE |
| **Clients** | Liste clients, detail (profil, commandes, fidelite, wallet), blocage/deblocage, recherche | HAUTE |
| **Coupons** | Creation (code, reduction %, montant fixe, livraison gratuite), limites (date debut/fin, nombre utilisations, montant minimum), desactivation, historique utilisation | HAUTE |
| **Codes parrainage** | Generation, suivi utilisation, rewards | MOYENNE |
| **Cartes cadeaux** | Emission (montant, destinataire, message), suivi solde, transactions, expiration | HAUTE |
| **Expeditions** | Creation lot expedition, ajout commandes au lot, etiquettes, suivi | HAUTE |
| **Methodes livraison** | Activation/desactivation (MR, GLS, Chrono), tarifs par poids, zones | HAUTE |
| **Factures** | Liste factures, generation PDF, telechargement, envoi email, format conforme | CRITIQUE |
| **Avis clients** | Liste, moderation (approuver/rejeter/supprimer), reponse admin | MOYENNE |
| **Livre d'or** | Liste messages, moderation, publication | BASSE |
| **Lives** | Creation live (titre, date, produits), configuration OBS, replay, chapitres, produits partages pendant live, chat moderation, analytics spectateurs | HAUTE |
| **Replay lives** | Video replay fonctionnel, chapitres navigables, produits affiches au bon moment, chat historique | HAUTE |
| **Proposition produits en live** | Partage produit pendant live → s'affiche chez les spectateurs, lien vers fiche produit, ajout panier direct depuis live | HAUTE |
| **Actualites** | Creation article (titre, contenu WYSIWYG, image, categorie), publication, modification, suppression | MOYENNE |
| **Looks** | Creation look (photo, produits associes), affichage front | BASSE |
| **Jeux — Roue** | Configuration (lots, probabilites, couleurs), test joueur, historique gains | MOYENNE |
| **Jeux — Grattage** | Configuration (lots, images), test joueur, historique | MOYENNE |
| **Jeux — Cartes** | Configuration (paires, lots), test joueur, historique | MOYENNE |
| **Fidelite** | Configuration paliers, points par euro, euros fidelite, historique transactions | HAUTE |
| **Credits magasin** | Ajout credits, historique, utilisation checkout | MOYENNE |
| **Colis ouverts** | Configuration, affichage front | BASSE |
| **Media** | Upload images, galerie, suppression, taille, recherche | HAUTE |
| **Slides homepage** | Creation, ordre, image, lien, mobile | MOYENNE |
| **Categories homepage** | Selection, ordre, image | MOYENNE |
| **Produits vedettes** | Selection, ordre, affichage front | MOYENNE |
| **Moyens de paiement** | Activation Stripe/PayPal, configuration | HAUTE |
| **Programme ambassadeur** | Configuration, candidatures, validation | BASSE |
| **Sauvegarde** | Export DB, import | MOYENNE |
| **Settings** | Nom site, logo, couleurs, config globale | HAUTE |
| **Pages SEO** | Meta title/description par page, og:image | MOYENNE |

### 1.4 Responsive — TOUTES les pages sans exception

| Page | Mobile 375px | Tablette 768px | Desktop 1280px+ |
|---|---|---|---|
| Homepage | [ ] | [ ] | [ ] |
| Shop/Boutique | [ ] | [ ] | [ ] |
| Fiche produit | [ ] | [ ] | [ ] |
| Panier | [ ] | [ ] | [ ] |
| Checkout | [ ] | [ ] | [ ] |
| Confirmation | [ ] | [ ] | [ ] |
| Login | [ ] | [ ] | [ ] |
| Register | [ ] | [ ] | [ ] |
| Mot de passe oublie | [ ] | [ ] | [ ] |
| Compte | [ ] | [ ] | [ ] |
| Wishlist | [ ] | [ ] | [ ] |
| Live | [ ] | [ ] | [ ] |
| Carte cadeau | [ ] | [ ] | [ ] |
| Livre d'or | [ ] | [ ] | [ ] |
| Colis ouverts | [ ] | [ ] | [ ] |
| Looks | [ ] | [ ] | [ ] |
| Actualites | [ ] | [ ] | [ ] |
| Detail article | [ ] | [ ] | [ ] |
| Contact | [ ] | [ ] | [ ] |
| Qui sommes-nous | [ ] | [ ] | [ ] |
| CGV | [ ] | [ ] | [ ] |
| Mentions legales | [ ] | [ ] | [ ] |
| Politique confidentialite | [ ] | [ ] | [ ] |
| Frais de port | [ ] | [ ] | [ ] |
| Categorie | [ ] | [ ] | [ ] |
| Admin dashboard | [ ] | [ ] | [ ] |
| Admin produits liste | [ ] | [ ] | [ ] |
| Admin produit creation | [ ] | [ ] | [ ] |
| Admin produit edition | [ ] | [ ] | [ ] |
| Admin commandes | [ ] | [ ] | [ ] |
| Admin clients | [ ] | [ ] | [ ] |
| Admin lives | [ ] | [ ] | [ ] |
| Admin expeditions | [ ] | [ ] | [ ] |
| Admin factures | [ ] | [ ] | [ ] |

### 1.5 Securite — verification complete

| Point | Quoi verifier | Priorite |
|---|---|---|
| RLS Supabase | products (lecture publique OK), orders (user only), profiles (user only), addresses (user only), cart_items (user only), invoices (user only) | CRITIQUE |
| Service role key | Grep "service_role" dans tout le code front — doit etre uniquement cote serveur (API routes) | CRITIQUE |
| Stripe webhooks | Signature webhook verifiee dans /api/stripe | CRITIQUE |
| PayPal webhooks | Signature verifiee dans /api/paypal | HAUTE |
| XSS | dangerouslySetInnerHTML sur descriptions — verifier sanitization | HAUTE |
| CSRF | Tokens Supabase Auth valides | HAUTE |
| Rate limiting | /api/contact, /api/send-email, /api/create-payment-intent protegees | HAUTE |
| .env + .gitignore | Verifier que AUCUNE cle n'est commitee | CRITIQUE |
| Admin protection | Pages /admin/* accessibles uniquement si is_admin = true | CRITIQUE |
| Injections SQL | Supabase client utilise parameterized queries — verifier les .rpc() | MOYENNE |
| CORS | Verifier headers Vercel | MOYENNE |

---

## Phase 2 — Verification du code

### 2.1 Nettoyage code

| Tache | Description | Priorite |
|---|---|---|
| **Console.log** | Supprimer tous les console.log de debug (login, auth, cart) | HAUTE |
| **Composants non utilises** | Identifier et supprimer les composants morts | MOYENNE |
| **Imports non utilises** | Nettoyer les imports dans tous les fichiers | MOYENNE |
| **Types any** | Remplacer les `any` par des types corrects | BASSE |
| **Doublons context/store** | AuthContext + auth-store font la meme chose → unifier | MOYENNE |
| **Fichiers .bolt** | Supprimer le dossier .bolt/backups (reliquat) | HAUTE |

### 2.2 Nettoyage base de donnees

| Tache | Description | Priorite |
|---|---|---|
| **Tables WooCommerce** | Supprimer `woocommerce_cache`, `woocommerce_categories_cache` | HAUTE |
| **Doublon livre d'or** | Garder `livre_dor`, supprimer `livre-dor` (tiret) | HAUTE |
| **Doublon wishlist** | Garder `wishlists` + `wishlist_items`, supprimer `wishlist` si vide | HAUTE |
| **Tables vides** | Identifier et supprimer les tables avec 0 lignes qui ne servent plus | MOYENNE |
| **Index manquants** | Ajouter index sur product_id, category_id, user_id la ou ca manque | MOYENNE |
| **is_variable_product** | UPDATE products SET is_variable_product = true WHERE id IN (SELECT DISTINCT product_id FROM product_variations) | HAUTE |
| **tva_rate column** | ALTER TABLE products ADD COLUMN IF NOT EXISTS tva_rate NUMERIC DEFAULT 20 | HAUTE |
| **Colonnes orphelines** | Identifier les colonnes jamais utilisees dans le code | BASSE |

### 2.3 Performance

| Point | Quoi verifier | Priorite |
|---|---|---|
| **Lighthouse score** | Homepage, shop, produit — viser > 80 sur mobile | HAUTE |
| **Images** | Format WebP, taille optimisee, lazy loading | HAUTE |
| **Bundle size** | Verifier les imports lourds (jspdf, recharts, embla) | MOYENNE |
| **Requetes Supabase** | N+1 queries, select * inutiles, .single() | MOYENNE |
| **Cache** | Headers cache Vercel, revalidation ISR | MOYENNE |

---

## Phase 3 — Bugs connus a re-tester apres les fixes

| Bug | Fix applique | Test precis |
|---|---|---|
| Login mobile | callback + Suspense | iPhone Safari : inscription → email verif → callback → connecte |
| Stock panier | Validation addToCart | Produit stock=1 : ajouter 1 OK, ajouter 2 = erreur toast |
| Creation produit ancien | clearSavedData | Creer produit A → OK → creer produit B → champs vides |
| Variantes rupture | Somme stock | Produit 3 variantes (stock 2+3+0) → affiche "En stock" |
| Recherche mobile | hidden→flex | Icone loupe visible sur iPhone |
| Avatar | Storage upload | Upload photo → refresh → photo toujours la |
| Image variante | useEffect scroll | Cliquer rouge → image rouge, cliquer bleu → image bleue |
| Panier sans variante | Check variations.length | Produit a variantes : clic "Je craque" → redirige vers fiche |
| Parfums pastilles | isColor strict | Attribut "Parfum" = dropdown texte, "Couleur" = pastilles |
| Session mobile | No router.refresh | Quitter Safari 30s, revenir = toujours connecte |
| Footer double | Supprime hardcode | 1 seul "Nouveautes" dans le footer |
| Banner mobile | Keyframe marquee | Texte "Bienvenue dans la Kavern" defile sur tel |
| Actu nav | Ajout lien | "Actu" visible dans nav desktop entre Nouveautes et categories |
| Diamant guest | Toast message | Cliquer diamant non connecte = toast "Connectez-vous" |
| TVA | Select 4 taux | Creer produit alimentaire 5.5% → marge calculee correctement |
| Bulk actions | Checkboxes + boutons | Cocher 3 produits → "Prive live" → statut change |
| Packs/Lots | Config complete | Creer lot de 5 savons → client choisit 5 parfums → panier |

---

## Phase 4 — Migrations critiques avant mise en prod

| Tache | Description | Priorite |
|---|---|---|
| **SMTP** | Migrer mail.laboutiquedemorgane.com → domaine KAVERN | CRITIQUE |
| **EMAIL_FROM** | Remplacer "La Boutique de Morgane" par "La Kavern" partout | CRITIQUE |
| **Stock decrementation** | Trigger Supabase : decrementer stock apres commande validee | CRITIQUE |
| **Textes "Morgane"** | Grep + remplacer toutes references La Boutique de Morgane | CRITIQUE |
| **Favicon + OG** | Mettre a jour favicon, og:image, apple-touch-icon avec logo KAVERN | HAUTE |
| **Tests paiement** | Stripe test mode → commande complete → facture → email | CRITIQUE |
| **Tests PayPal** | PayPal sandbox → commande complete | HAUTE |
| **Google Maps API** | Verifier que la cle est restreinte au domaine KAVERN | HAUTE |
| **Analytics** | Verifier Google Analytics ou Plausible | MOYENNE |
| **Sitemap** | Generer sitemap.xml dynamique | MOYENNE |
| **robots.txt** | Configurer correctement | MOYENNE |

---

## Phase 5 — Live Shopping — verification complete

| Fonctionnalite | Quoi tester | Priorite |
|---|---|---|
| **Creation live** | Titre, description, date programmee, produits pre-selectionnes | HAUTE |
| **Configuration OBS** | Cle de stream, URL serveur, connexion | HAUTE |
| **Live en cours** | Video en direct, latence, qualite | HAUTE |
| **Chat en direct** | Messages spectateurs, moderation admin, emojis, ban | HAUTE |
| **Emotions live** | Reactions (coeur, feu, wow), animation, compteur | MOYENNE |
| **Proposition produits** | Admin partage produit → spectateur le voit en overlay | CRITIQUE |
| **Achat depuis live** | Cliquer produit partage → fiche produit → ajout panier → checkout | CRITIQUE |
| **Compteur spectateurs** | Nombre de viewers en temps reel | MOYENNE |
| **Replay** | Video enregistree accessible apres le live | HAUTE |
| **Chapitres replay** | Navigation dans le replay par chapitres | HAUTE |
| **Produits en replay** | Les produits partages pendant le live s'affichent au bon moment du replay | HAUTE |
| **Chat replay** | Historique chat visible pendant le replay | MOYENNE |
| **Analytics live** | Stats (viewers, pic, engagement, produits cliques, CA genere) | MOYENNE |
| **Liste anciens lives** | Page /live avec tous les replays, triees par date | HAUTE |
| **Mobile live** | Video, chat, produits, emotions — tout fonctionne sur tel | CRITIQUE |

---

## Phase 6 — Evolutions futures

| Feature | Description | Complexite |
|---|---|---|
| **Notifications push** | OneSignal deja configure, activer les notifications commande/promo | MOYENNE |
| **Programme ambassadeur** | Page admin existe, connecter au front (candidature, validation, commission) | MOYENNE |
| **Multi-langues** | i18n FR/EN | GROS |
| **App mobile PWA** | Manifest, service worker, install prompt | MOYENNE |
| **IA recommendations** | Produits similaires via embeddings Supabase pgvector | GROS |
| **Historique prix** | Tracker les changements de prix, afficher "etait a X€" | BASSE |
| **A/B testing** | Homepage variantes, test conversion | BASSE |
| **Click & Collect** | Retrait en magasin | MOYENNE |
| **Abonnements** | Box mensuelle (Stripe recurring) | GROS |
| **Avis verifies** | Integration Trustpilot ou similaire | MOYENNE |

---

## AUDIT DIVINE — 31 mars 2026

> Audit securite + bugs + DB complet. Detail dans `DIVINE-AUDIT-RESULTATS.md`
> Plan d'action priorise dans `TACHES-RESTANTES.md`

### Bilan session 31/03 — Ce qui a ete fait

| Action | Status |
|--------|--------|
| Trigger handle_new_user fixe (blocked -> is_blocked) | FAIT SQL |
| Profil Andre cree + 5EUR bienvenue | FAIT SQL |
| Cashback 2% trigger (apply_order_cashback) | FAIT SQL |
| Stock manage_stock active sur produits | FAIT SQL |
| RLS profiles + loyalty pour users normaux | FAIT SQL |
| Shop to Shop = Chronopost | FAIT SQL |
| Stripe validation prix server-side | FAIT CODE |
| Contact form anti-XSS | FAIT CODE |
| CRON secret enforcement (4 routes) | FAIT CODE |
| Middleware admin protection | FAIT CODE |
| Upload MIME whitelist + crypto filename | FAIT CODE |
| CartContext tva_rate reload | FAIT CODE |
| Email facture contact@kavern-france.fr | FAIT CODE |
| 24 tests E2E (securite + smoke) | FAIT CODE |
| Tests: 22/23 PASS (1 crash produit confirme) | FAIT |

### Ce qui reste (64 problemes, 4 phases)

| Phase | Nb | Effort | Contenu |
|-------|----|--------|---------|
| Phase 1 CRITIQUES | 12 | ~2h | Supprimer debug relay, fix PayPal auth, crash produit, order_items product_id, RLS, race condition, TVA NaN |
| Phase 2 HIGH | 18 | ~3h | Auth sur 10 routes, XML injection, ShareButtons, view categories, coupon FK, Promise render, Stripe/PayPal flow, games |
| Phase 3 MEDIUM | 15 | ~2h | Rate limiting, error messages, bulk actions, cashback calcul, IDOR, type mismatches |
| Phase 4 LOW | 11 | ~1h | Invoice variation, cart merge, cascade delete, tables orphelines |

### Andre — En attente

| Sujet | Status |
|-------|--------|
| Page profil ne charge pas | FIXE (trigger + profil cree) |
| 5EUR bienvenue | FIXE (profil avec wallet_balance=5.00) |
| Bonus quotidien | FIXE (RLS loyalty) |
| Nouveau compte pas dans admin | FIXE (profil existe) |
| Shop to Shop = Chronopost | FIXE (SQL) |
| Stock ne decremente pas | FIXE (manage_stock=true) + RESTE order_items.product_id |
| Cashback 2% | FIXE (trigger cree) + RESTE cashback sur total pas subtotal |
| TVA multi-taux panier | FIXE (tva_rate dans CartContext) |
| TVA facture | DEJA OK dans le vrai repo |
| Virement = "en attente de virement" | DEJA OK dans le vrai repo |
| Email facture mauvaise adresse | FIXE (contact@kavern-france.fr) |
| Email o2switch ne marche plus | A VERIFIER (cpanel, espace disque) |
| Live YouTube OBS | A INTEGRER (embed non repertorie) |
| Avis impossible | A INVESTIGUER (RLS guestbook) |
| Colis ouvert | PARTIELLEMENT OK (flow existe, nommage "mes colis ouverts") |
| Produit test config lot | A VERIFIER (status draft?) |
