# GUIDE DES FONCTIONNALITÉS — KAVERN
## Manuel d'utilisation pour André OLIVARES

---

## 1. GESTION DES PRODUITS

### Créer un produit
- Admin → Produits → **Ajouter un produit**
- Remplir : Nom, SKU, Prix de vente, Prix d'achat HT, Stock, Poids
- Ajouter photo principale + galerie
- Sélectionner les catégories
- **Badge Marketing** : choisir dans le dropdown (Édition limitée, Coup de cœur, Best-seller, Exclu Live, Nouveau) — le badge s'affiche automatiquement sur la photo du catalogue
- **Sections repliables** : cliquer sur les chevrons pour ouvrir/fermer SEO, Options, etc.
- **Produit Diamant** : cocher pour activer les pépites cachées
- **TVA** : sélectionner le taux (20%, 10%, 5.5%, 0%)

### Produits à variantes
- Cocher "Variantes" dans Options
- Ajouter les axes (ex: Parfum, Taille)
- Remplir chaque variante (SKU, prix, stock, image)
- Le stock affiché sur le catalogue = somme de toutes les variantes
- Le bouton "Choisir ma pépite" redirige vers la fiche produit

### Édition rapide du stock
- Dans la liste des produits, **cliquer sur le badge de stock** (noir ou rouge)
- Un champ de saisie apparaît : taper le nouveau stock → Entrée ou OK
- Sauvegarde instantanée sans ouvrir la fiche

### Actions groupées
- Cocher les produits avec les cases à cocher
- Boutons : Publier / Mettre en privé live / Supprimer la sélection

### Export inventaire CSV
- Bouton **"Export CSV"** vert dans l'en-tête de la liste produits
- Colonnes : Nom, Variante, UGS, Quantité, Prix Vente TTC, Prix Achat HT
- Pour ton comptable

---

## 2. COMMANDES

### Gestion des commandes
- Admin → Commandes
- Filtrer par statut (En attente, En cours, Expédiée, Livrée, Annulée)
- Filtrer par statut de paiement
- Cliquer sur "Détails" pour voir le détail complet

### Changer le statut
- Dans le détail commande, sélectionner le nouveau statut
- **Quand tu passes en "Expédié"** : un email automatique est envoyé à la cliente avec le lien de suivi (si Sendcloud configuré)

### Export comptable CSV
- Bouton **"Export Comptable"** vert dans l'en-tête
- Colonnes : Date, N° Commande, Montant HT, Montant TVA, Montant TTC
- Uniquement les commandes payées
- Pour ton comptable (obligation de transmission sous 10 jours)

### Factures PDF
- Bouton télécharger sur chaque commande (côté admin ET côté client)
- Mentions légales KAVERN incluses (SIREN, TVA, adresse)

---

## 3. LE COLIS OUVERT

### Logique (comment ça marche pour la cliente)
1. Elle passe une commande et choisit un transporteur → elle **paye les frais de port** à ce moment
2. L'option "Ouvrir un Colis Ouvert" crée un colis avec un **timer de 7 jours**
3. Sur ses prochains achats, elle sélectionne "Ajouter à mon Colis Ouvert" → **0 € de frais de port**
4. Au bout de 7 jours ou quand elle clique "Clôturer et expédier" → le colis part

### Côté admin
- Admin → Colis Ouverts : liste de tous les colis en cours
- Chaque colis affiche : articles, valeur, compte à rebours, statut
- Quand un colis est clôturé, il passe en "Fermé" → tu prépares l'expédition

### Côté client (Espace client → Mes Colis Ouverts)
- Voir ses articles dans le colis
- Jauge de poids (X kg / 10 kg max)
- Compte à rebours des 7 jours
- Bouton "Clôturer et expédier maintenant"
- **Pas de bouton pour créer un colis vide** — ça se fait au checkout uniquement

---

## 4. LIVE SHOPPING

### Préparer un live
1. Admin → **Live Shopping** → Créer un Live
2. Renseigner : titre, description, date programmée, miniature
3. Ajouter les produits à présenter

### Configurer OBS
1. Dans la fiche du live admin, copier **la clé de stream** et **l'URL RTMP**
2. Dans OBS → Paramètres → Diffusion → Service : Personnalisé
3. Coller l'URL serveur et la clé
4. Régler la résolution (1920x1080 recommandé) et le débit (3000-6000 kbps)

### Lancer le live
1. Démarrer le streaming dans OBS
2. Dans l'admin KAVERN, passer le live en statut **"En direct"**
3. La page `/live` affiche automatiquement le flux vidéo

### Pendant le live
- **Chat en temps réel** : les clientes interagissent
- **Produits** : elles peuvent ajouter au panier directement depuis l'onglet Produits
- **Jauge d'audience** : elle monte avec les spectateurs
- **Coffre de la Kavern** : quand la jauge atteint l'objectif, tu peux lancer le tirage
- **Réactions** : les clientes envoient des emojis en direct

### Après le live
- Passer en statut "Terminé"
- Le **replay** est automatiquement disponible avec navigation par chapitres
- Les clientes ont 24h pour finaliser leur panier

### Texte SEO
Un texte SEO complet est intégré en bas de la page Live (H2 shopping interactif, coffre, replays, réassurance) — il est lu par Google sans gêner l'expérience visuelle.

---

## 5. SYSTÈME DE FIDÉLITÉ

### Cagnotte
- Chaque cliente accumule des € dans sa cagnotte
- Sources : cashback (2% des achats), avis Livre d'Or (0,20 €), pépites diamant (0,10 €), connexion quotidienne (0,10 €), présence live (0,20 €)

### Multiplicateurs (rangs)
- **Esprit Curieux** (x1) : palier de départ
- **Passionné** (x2) : le multiplicateur double tous les gains
- **Collectionneur** (x3) : le multiplicateur triple
- Le passage est **automatique** (calculé par la base de données)

### Livre d'Or
- Admin → Site → **Livre d'Or**
- Quand tu cliques **"Approuver"** sur un avis → **0,20 € crédités automatiquement** sur la cagnotte de la cliente
- Les avis classiques sur les fiches produits ne rapportent rien

### Pépites Diamant
- Sur certains produits (marqués "Diamant"), un bouton "Pépite découverte !" apparaît aléatoirement
- La cliente clique → **0,10 € × multiplicateur** crédités
- Un seul gain par produit par utilisateur

### Non-cumul
- Code promo (BIENVENUE5, etc.) et cagnotte : **non cumulables**
- Si un code promo est actif, la cagnotte est grisée, et vice-versa
- Une seule réduction par commande

---

## 6. JEUX (GAMIFICATION)

### Roue de la Fortune
- Apparaît comme popup aux clientes connectées
- Gains : coupons de réduction sauvegardés automatiquement dans "Mes Coupons"

### Scratch Card / Card Flip
- Même mécanique : gain sauvegardé dans user_coupons
- Visible dans Espace Client → Mes Coupons

---

## 7. CHECKOUT & PAIEMENT

### Moyens de paiement
- **Carte bancaire** (Stripe) — 3D Secure
- **PayPal** (dont 4x sans frais)
- **Virement bancaire** — RIB affiché sur la page confirmation
- **Paiement à la livraison**

### Minimum de commande
- **10 € minimum** sur le montant des articles (hors frais de port)
- Ce minimum s'applique APRÈS déduction des cagnottes et coupons
- Si le "reste à payer" tombe en dessous de 10 €, le checkout bloque

### Code BIENVENUE5 (anti-fraude)
- Le code est validé contre la base de données (vérification validité, max_uses, min_purchase)
- **Anti-fraude** : vérifie si le même utilisateur, la même adresse ou le même téléphone a déjà utilisé ce code
- Après utilisation, `uses_count` est incrémenté

### Cartes cadeaux
- Le reliquat reste sur le même code (ex: carte 50€, panier 30€ → 20€ restants)
- Paiement partagé : la carte déduit ce qu'elle peut, le reste par CB/PayPal
- Attribution automatique au destinataire par email

---

## 8. EMAILS TRANSACTIONNELS

| Email | Déclencheur | Contenu |
|-------|-------------|---------|
| Bienvenue | Inscription | Texte André + 5€ BIENVENUE5 |
| Confirmation commande | Paiement validé | Récap articles + Option A (expédition) / Option B (Colis Ouvert) |
| Expédition | Statut → "Expédié" | Nom transporteur + lien suivi |
| Demande d'avis | 3-5 jours après livraison | Lien Livre d'Or + 0,20€ cagnotte |
| Panier abandonné | 4h après abandon | Rappel automatique (cron) |
| Colis J-1 | 24h avant fermeture | Alerte colis ouvert (cron) |

**Expéditeur** : "André de KAVERN" <contact@kavern-france.fr>

---

## 9. SEO & PARTAGE

### Open Graph (Facebook/WhatsApp)
- Chaque produit génère automatiquement une "carte" de partage avec photo, titre et description
- Les pages fixes ont aussi leurs balises OG

### Sitemap
- Généré dynamiquement : produits, catégories, articles de blog
- Accessible à `/sitemap.xml`

### Robots.txt
- Bloque /admin/, /api/, /test-order
- Accessible à `/robots.txt`

---

## 10. SÉCURITÉ

### RLS (Row Level Security)
- Activé sur 13+ tables Supabase
- Les utilisateurs ne voient que leurs propres données

### Date de naissance
- Non modifiable une fois renseignée (anti-fraude anniversaire)

### RGPD
- Politique de confidentialité complète sur le site
- Contact : contact@kavern-france.fr

---

## 11. ESPACE CLIENT

### Pages disponibles
- Mes informations (profil, adresse, date de naissance verrouillée)
- Mes commandes (pagination 10/page, suivi colis, factures PDF, badge Colis Ouvert)
- Mes colis ouverts (articles, jauge poids, countdown, bouton clôturer)
- Ma cagnotte (historique gains, solde, rang)
- Mes coupons (disponibles + historique utilisés)
- Mes cartes cadeaux (achetées + reçues)
- Ma wishlist (favoris)

---

*Document généré le 27 mars 2026*
*Grégory DEMEULENAERE — Web Pro Formation*
