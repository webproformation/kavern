# TACHES RESTANTES — KAVERN

> Organise par priorite. Mise a jour le 27/03/2026.

---

## PRIORITE 1 — BLOQUANT AVANT LIVRAISON

Ces elements empechent la mise en ligne ou le fonctionnement des commandes.

| # | Tache | Complexite | Qui |
|---|---|---|---|
| 1.1 | **Appliquer migration RLS** sur Supabase prod (12 tables critiques) | 15 min | Greg |
| 1.2 | **Migrer SMTP** — Andre doit fournir un serveur mail @kavern-france.fr ou on utilise Resend/Brevo | 30 min | Andre fournit + Greg config |
| 1.3 | **Tester checkout Stripe** mode test (commande complete → facture → email) | 30 min | Greg |
| 1.4 | **Tester checkout PayPal** sandbox (commande complete → DB mise a jour) | 30 min | Greg |
| 1.5 | **Pointer domaine kavern-france.fr** vers Vercel (DNS) | 15 min | Andre (DNS) + Greg (Vercel) |
| 1.6 | **Regenerer cle OneSignal** (revoquee par GitHub le 28/12/2025) | 10 min | Andre |
| 1.7 | **Deployer sur Vercel** le code corrige (build 116 pages OK) | 15 min | Greg |

---

## PRIORITE 2 — BUGS A CORRIGER (signales par Andre le 26/03)

Tous les bugs du mail du 26/03 — la plupart fixes le 26/03 par notre session.

| # | Bug | Statut | Reste a faire |
|---|---|---|---|
| 2.1 | Login/Register mobile | ✅ FIXE | Tester sur iPhone Safari |
| 2.2 | Stock panier > stock reel | ✅ FIXE | Tester |
| 2.3 | Creation produit affiche l'ancien | ✅ FIXE | Tester creer 2 produits d'affilee |
| 2.4 | Variantes "rupture" au lieu de stock total | ✅ FIXE | Tester produit avec 3 variantes |
| 2.5 | Recherche mobile invisible | ✅ FIXE | Tester |
| 2.6 | Photo de profil ne fonctionne pas | ✅ FIXE | Tester upload + refresh |
| 2.7 | Image variante ne change pas au clic couleur | ✅ FIXE | Tester |
| 2.8 | Ajout panier sans choisir variante | ✅ FIXE | Tester |
| 2.9 | Parfums affichent pastilles noires | ✅ FIXE | Tester parfum + couleur |
| 2.10 | Session perdue quand on quitte/revient | ✅ FIXE | Tester |
| 2.11 | Footer double "Nouveautes" | ✅ FIXE | Verifier |
| 2.12 | Banner ne defile pas mobile | ✅ FIXE | Tester |
| 2.13 | "Actu" manquant nav desktop | ✅ FIXE | Verifier |
| 2.14 | Diamant guests pas de message | ✅ FIXE | Tester |
| 2.15 | Pepites decouvertes | ✅ FIXE (= diamant) | Tester |
| 2.16 | Creation produit bug (cache) | ✅ FIXE | Tester |
| 2.17 | Variantes stock = rupture | ✅ FIXE | Tester |
| 2.18 | Mise en avant (badges sur photos) | ✅ DEJA OK | — |
| 2.19 | TVA par produit | ✅ FIXE | Tester creation produit alimentaire |
| 2.20 | Prive exclu live + bulk actions | ✅ FIXE | Tester |
| 2.21 | Rich text description | ✅ DEJA OK | — |
| 2.22 | Status mobile dropdown | ✅ FIXE | Tester |
| 2.23 | Lots/bundles | ✅ FIXE | Tester |
| 2.24 | Swipe photos mobile | ✅ FIXE | Tester |

---

## PRIORITE 3 — PARAMETRAGE (pas du dev, config admin)

| # | Tache | Qui |
|---|---|---|
| 3.1 | **Changer code parrainage** "morgane2025" → code KAVERN | Admin (Andre ou Greg) |
| 3.2 | **Changer logo** inscription/parrainage | Admin |
| 3.3 | **Mettre a jour categories footer** (anciennes → nouvelles) | Admin |
| 3.4 | **Liens reseaux sociaux** Facebook, Instagram, TikTok, YouTube | Admin (textes fournis par Andre) |
| 3.5 | **Banner du haut** : "Cree ton compte et recois 5 EUR" ou "Bienvenue dans la Kavern" | Admin |
| 3.6 | **Programme fidelite** : renommer Debutant→Esprit curieux, Expert→Passionne, Legende→Collectionneur | Greg (code) |
| 3.7 | **Cadeau 69 EUR** : c'est un cadeau physique glisse par Andre, pas une feature code. Juste afficher le message dans le panier | Verifier si affiche |
| 3.8 | **Compteurs homepage** "Nos petits bonheurs en chiffres" : mettre vide au lieu de 0 | Greg (code) |
| 3.9 | **Sliders** : verifier que chaque slider redirige vers la bonne page | Admin |

---

## PRIORITE 4 — FONCTIONNALITES A ACTIVER/VERIFIER

| # | Fonctionnalite | Statut | Action |
|---|---|---|---|
| 4.1 | **Connexion quotidienne 0.10 EUR** | Code present dans AuthContext | Verifier que ca fonctionne en testant |
| 4.2 | **Coupon bienvenue 5 EUR** apres jeu de cartes | Logique existante | Verifier le workflow complet |
| 4.3 | **Roue de la fortune** — coupon gagne mais pas retrouve | Bug signale | A debugger |
| 4.4 | **Cagnotte multiplicateur** (x1/x2/x3, plafond 30 EUR) | Code existant | Verifier les paliers et le plafond |
| 4.5 | **Push notifications** (OneSignal) | Cle revoquee | Regenerer cle + tester |
| 4.6 | **PWA manifest** | Jamais cree | Creer manifest.json + service worker |
| 4.7 | **Relance panier abandonne** (email auto X heures apres) | Template email existe | Verifier le cron job |
| 4.8 | **Email J-1 fermeture colis ouvert** | Template email existe | Verifier le cron job |
| 4.9 | **Email 7 jours apres commande** (demande avis) | Template email existe | Verifier le cron job |
| 4.10 | **Cheque anniversaire** (auto 3 jours avant) | Prevu dans le cahier des charges | Verifier si implemente |

---

## PRIORITE 5 — FONCTIONNALITES DESACTIVEES VOLONTAIREMENT

Andre a demande explicitement de desactiver ces features (mail 20/02/2026).
A reactiver uniquement quand il fera du textile.

| # | Fonctionnalite | Statut |
|---|---|---|
| 5.1 | Mensurations client | Desactive (page existe, module masque) |
| 5.2 | Badge "a ma taille" sur les produits | Desactive |
| 5.3 | Filtres taille/confort/coupe | Desactives |
| 5.4 | Systeme tailles numeriques (min/max) | Desactive |

---

## PRIORITE 6 — SECURITE (avant mise en prod reelle)

| # | Tache | Impact | Statut |
|---|---|---|---|
| 6.1 | **RLS Supabase** sur 12 tables critiques | CRITIQUE | Migration SQL prete, a appliquer |
| 6.2 | **Restreindre Google Maps API key** au domaine kavern-france.fr | MOYEN | Console Google Cloud |
| 6.3 | **Regenerer cles API** exposees sur GitHub (OneSignal, Google Maps) | HAUT | Andre + Greg |
| 6.4 | **Supprimer repo GitHub "laboutiquedemorgane"** (contient des cles) | HAUT | Greg |
| 6.5 | **Passer Stripe en mode LIVE** (actuellement test) | CRITIQUE avant vrai paiement | Andre (dashboard Stripe) |

---

## PRIORITE 7 — TESTS COMPLETS AVANT LIVRAISON

A faire en visio avec Andre.

| # | Test | Duree estimee |
|---|---|---|
| 7.1 | Creer un compte, verifier email callback | 5 min |
| 7.2 | Creer 2 produits (avec et sans variantes) | 10 min |
| 7.3 | Ajouter au panier, verifier stock | 5 min |
| 7.4 | Checkout complet Stripe mode test (carte 4242) | 10 min |
| 7.5 | Verifier facture PDF generee | 5 min |
| 7.6 | Verifier email de confirmation | 5 min |
| 7.7 | Tester colis ouvert (ouvrir, ajouter, fermer) | 10 min |
| 7.8 | Tester diamant cache (trouver, popup, cagnotte) | 5 min |
| 7.9 | Tester jeu de cartes | 5 min |
| 7.10 | Tester live (creer, chat, partager produit) | 10 min |
| 7.11 | Tester responsive mobile (5 pages cles) | 10 min |
| 7.12 | Verifier mentions legales, CGV, confidentialite | 5 min |
| **TOTAL** | | **~85 min** |

---

## RESUME

| Priorite | Nombre | Statut |
|---|---|---|
| P1 — Bloquant livraison | 7 | A faire |
| P2 — Bugs Andre | 24 | 22 fixes, 2 a verifier |
| P3 — Parametrage admin | 9 | Andre + Greg |
| P4 — Features a activer | 10 | A verifier/debugger |
| P5 — Desactivees volontairement | 4 | En reserve |
| P6 — Securite | 5 | Critique avant prod |
| P7 — Tests visio | 12 | 85 min avec Andre |
| **TOTAL** | **71 taches** | |
