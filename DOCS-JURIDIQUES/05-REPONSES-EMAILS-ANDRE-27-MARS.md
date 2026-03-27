# RÉPONSES AUX EMAILS D'ANDRÉ — 27 MARS 2026

À adapter et envoyer par Greg. Ton = professionnel, factuel, bienveillant mais ferme.

---

## EMAIL 1 — Module Facturation & Comptabilité (17h57)

Objet : Re: KAVERN - Vérification back-office : Module Facturation & Comptabilité

Bonjour André,

Merci pour ce point détaillé. Voici l'état des lieux pour ton comptable :

**1. Numérotation séquentielle**
La numérotation est en place (CMD-XXXXXXXXX). Pour passer au format FAV-2026-0001 avec protection anti-suppression, c'est une évolution du module facturation qui nécessite :
- Une table dédiée `invoices` en base de données
- Un compteur séquentiel avec verrouillage (pas de trous)
- L'interdiction de suppression (soft-delete uniquement)

C'est prévu dans la feuille de route mais c'est un développement spécifique qui n'était pas dans le périmètre initial.

**2. PDF avec mentions légales KAVERN**
✅ Déjà opérationnel. Les factures PDF générées contiennent : KAVERN SASU, capital 1 000 €, siège social, SIREN 102 355 443, TVA FR37102355443, RCS Dunkerque. J'ai corrigé un bug d'affichage aujourd'hui même (les couleurs du PDF crashaient).

**3. Ventilation TVA multi-taux**
Le champ taux de TVA par produit existe déjà dans l'admin (20%, 10%, 5.5%, 0%). Pour que la facture PDF affiche le détail ventilé (HT par taux, montant TVA par taux, TTC), c'est une évolution du générateur PDF. Développement spécifique hors périmètre initial.

**4. Système d'Avoirs**
La génération d'avoirs (AVO-2026-XXXX) avec sa propre numérotation séquentielle, c'est un module complet à développer :
- Table `credit_notes` en base
- Numérotation indépendante
- Génération PDF avoir
- Lien avec la commande d'origine
- Remise en stock automatique

C'est un développement conséquent (estimé 2-3 jours) qui n'était absolument pas prévu dans le devis initial.

**5. Export Comptable CSV**
L'export CSV avec filtrage par période (Date, N° Facture, HT, TVA, TTC) est réalisable. C'est un développement spécifique additionnel.

**En résumé :** Le point 2 est OK. Les points 1, 3, 4 et 5 sont des développements supplémentaires qui n'étaient pas prévus au devis. Je les note dans la feuille de route.

Cordialement,
Grégory

---

## EMAIL 2 — Email de Bienvenue (17h33)

Objet : Re: L'Email de Bienvenue (Création du compte)

Bonjour André,

Bien noté pour le template de l'email de bienvenue. Le contenu est clair et bien rédigé, je vais l'intégrer.

Concernant le bloc "5 € BIENVENUE5" temporaire et désactivable : c'est techniquement faisable. Je prévois un paramètre dans l'admin "Paramètres du site" pour activer/désactiver ce bloc sans toucher au code.

Note : les emails transactionnels nécessitent un serveur SMTP opérationnel. Pour rappel, j'attends toujours de ta part les identifiants SMTP de ton hébergeur O2switch (contact@kavern-france.fr). Sans ça, aucun email ne partira.

Cordialement,
Grégory

---

## EMAIL 3 — Email Post-Achat / Demande d'avis (17h39)

Objet : Re: L'Email "Post-Achat" (Demande d'avis pour la cagnotte)

Bonjour André,

Bien reçu. Un cron job de demande d'avis est déjà en place (J+7 après expédition). Je vais :
- Ajuster le timing à 3-5 jours après le statut "Livré" (au lieu de J+7 après expédition)
- Ajouter la condition d'exclusion : ne pas envoyer si un avis existe déjà pour cette commande
- Mettre à jour le template avec ton texte

Même remarque : tout ça dépend du SMTP O2switch que j'attends.

Cordialement,
Grégory

---

## EMAIL 4 — Email Confirmation de Commande (17h43)

Objet : Re: E-mail de Confirmation de Commande

Bonjour André,

Noté. Le template de confirmation existe déjà. Je vais l'enrichir avec :
- Ton texte personnalisé
- Le tableau récapitulatif des articles
- L'affichage conditionnel Option A (expédition classique) / Option B (Colis Ouvert)

C'est une mise à jour du template existant, je l'intègre à la prochaine livraison.

Cordialement,
Grégory

---

## EMAIL 5 — Email d'Expédition du Colis (17h54)

Objet : Re: E-mail d'Expédition du Colis

Bonjour André,

Bien noté. Ce template sera déclenché quand tu passes une commande en statut "Expédié" dans l'admin. Il inclura :
- Le nom du transporteur (Mondial Relay / DPD / Chronopost)
- Le lien de suivi

Note importante : le lien de suivi dynamique dépend de l'intégration Sendcloud. Pour rappel, j'attends toujours tes clés API Sendcloud. Sans ça, le lien de suivi devra être saisi manuellement.

Cordialement,
Grégory

---

## EMAIL 6 — Modification "Vite chez vous" footer (18h05)

Objet : Re: Modif

Bonjour André,

✅ Déjà fait. J'ai retiré la mention du prix (4,90 €) de la page "Vite chez vous".

Pour le texte dans le pied de page (footer) du site, je vais aussi mettre à jour :
"Vos pépites emballées avec soin et une expédition rapide."
(sans la mention du prix)

Cordialement,
Grégory

---

## EMAIL 7 — Stocks Live, Anti-fraude & Logistique Colis Ouvert (18h51)

Objet : Re: KAVERN - Vérification back-office : Stocks "Live", Anti-fraude automatique & Logistique "Colis Ouvert"

Bonjour André,

Merci pour ce cahier des charges très détaillé. Je vais être transparent avec toi sur ce que ça représente :

**PARTIE 1 — Panier Live (Réservation 24h)**
Le système actuel ajoute au panier classique. La mécanique de "réservation temporaire avec déduction de stock + remise en stock automatique après 24h" est un développement spécifique majeur :
- Nouveau statut "réservé" sur les stocks
- Cron job de nettoyage des paniers expirés
- Remise en stock automatique

Ce n'était pas prévu dans le devis initial (le devis prévoyait un site e-commerce, pas une plateforme de live shopping avec réservation temps réel).

**PARTIE 2 — Sécurité & 3 Strikes**
- Le badge "Nouveau" sur la fiche client : réalisable simplement (vérifier si 0 commande passée).
- Le système "3 strikes" (blocage automatique après 3 paniers expirés) : c'est un développement anti-fraude complet avec compteur par client, logique de sanction automatique, et gestion admin des déblocages. Hors périmètre initial.

**PARTIE 3 — Bascule Colis Ouvert**
Le système de Colis Ouvert fonctionne déjà (ouverture, ajout à 0€, fermeture auto 7 jours). La logique "au moment du paiement" est celle qui est en place. Le cas d'expiration pendant une réservation live est lié à la Partie 1 (qui est un nouveau développement).

**PARTIE 4 — Admin Colis Ouvert**
- Onglet "Colis ouverts en cours" : ✅ existe déjà dans l'admin
- Compte à rebours 7 jours : ✅ en place
- Bon de préparation fusionné : ✅ existe (impression bordereau)
- Étiquette Sendcloud : dépend de tes clés API Sendcloud (que j'attends)
- Bouton "Annuler article" avec avoir partiel : c'est le module d'avoirs (cf. email Facturation) — développement spécifique

**En résumé :** Les bases du Colis Ouvert sont opérationnelles. Les mécaniques Live Shopping (réservation 24h, 3 strikes, anti-fraude) sont des développements supplémentaires conséquents qui n'étaient pas dans le périmètre contractuel.

Cordialement,
Grégory

---

## EMAIL 8 — Fidélité, Gamification & Livre d'Or (19h48)

Objet : Re: KAVERN - Vérification back-office : Fidélité, Gamification & Livre d'Or

Bonjour André,

**1. Séparation Livre d'Or vs Avis Produits**
✅ Confirmé. Le crédit de 0,20 € est rattaché uniquement au module "Livre d'Or". La validation d'un avis sur une fiche produit ne déclenche aucun gain.

**2. Automatisation du gain**
Le système est conçu pour que l'approbation d'un avis Livre d'Or crédite automatiquement la cagnotte. Je vais vérifier que le déclencheur fonctionne bien de bout en bout (approbation admin → crédit 0,20 € × multiplicateur → notification).

**3. Rangs & Multiplicateurs**
✅ Le système est en place dans Supabase :
- Esprit Curieux (x1) : palier de départ
- Passionné (x2) : à partir d'un certain seuil de dépenses
- Collectionneur (x3) : palier supérieur

Le passage d'un rang à l'autre est calculé automatiquement par un trigger en base de données. Le multiplicateur s'applique à tous les gains de cagnotte.

**4. Modification manuelle**
Oui, tu as la main dans l'admin pour ajuster manuellement la cagnotte et le rang d'un client (geste commercial, SAV). C'est dans la fiche client > section Fidélité.

Cordialement,
Grégory

---

## EMAIL 9 — BUGS CRITIQUES d'inventaire & Optimisations UX (20h46)

Objet : Re: KAVERN - BUGS CRITIQUES d'inventaire & Optimisations UX (Admin + Site)

Bonjour André,

**PARTIE 1 — Bugs à corriger**

1. **Affichage "Épuisé" sur produits variables** : Bien identifié. Le stock parent doit être la somme des variantes actives. Je corrige.

2. **Bouton "Je craque" grisé pour les variables** : OK, je vais changer le comportement : si le produit a des variantes, le bouton affichera "Choisir ma pépite" et redirigera vers la fiche produit.

3. **Dépassement de stock dans le panier** : Le contrôle de stock existe déjà à l'ajout au panier (il y a un toast "Stock insuffisant"). Je vais vérifier qu'il fonctionne aussi sur le bouton "+" du panier et le bloquer strictement au stock disponible.

**PARTIE 2 — Optimisations Admin**

Ce sont toutes des fonctionnalités nouvelles qui n'étaient pas dans le périmètre contractuel :

1. **Export inventaire CSV** : Développement spécifique (½ journée)
2. **Accordéons formulaire** : Amélioration UX (½ journée)
3. **Badges marketing dropdown** : Nouveau système (1 journée)
4. **Édition rapide stock** : Popup inline (1 journée)
5. **Actions groupées** : Cases à cocher + bulk actions (1-2 journées)

Je note tout dans la feuille de route. Les 3 bugs critiques sont prioritaires.

Cordialement,
Grégory

---

## EMAIL 10 — Minimum de commande, Non-cumul & Livraisons (21h41)

Objet : Re: KAVERN - Vérification back-office : Minimum de commande 10 €, Non-cumul des cagnottes & Livraisons

Bonjour André,

**PARTIE 1 — Minimum & Cagnottes**

1. **Minimum 10 € final** : ✅ Le minimum de 10 € est déjà en place au checkout. Je vais ajuster pour qu'il s'applique bien sur le montant APRÈS déduction des cagnottes et coupons (le "reste à payer" réel).

2. **Non-cumul BIENVENUE5 + Cagnotte** : Noté, je vais ajouter la règle d'exclusion : si un code promo est actif, les cagnottes (porte-monnaie + fidélité) sont grisées, et vice-versa. Une seule réduction par commande.

**PARTIE 2 — Livraisons**

1. **Carte interactive Point Relais** : L'intégration d'une carte Mondial Relay interactive (API avec sélection visuelle du point relais) est un développement spécifique conséquent. Le système actuel permet de saisir un point relais. La carte interactive avec géolocalisation est une feature additionnelle hors devis.

2. **Automatisation étiquettes Sendcloud** : Oui, c'est prévu. Mais j'attends toujours tes clés API Sendcloud pour connecter le système.

3. **Gestion retours (remise stock + avoir)** : C'est le même module d'avoirs évoqué dans ton email sur la facturation. Développement spécifique à planifier.

Cordialement,
Grégory

---

## EMAIL 11 — Logique de Poids 10 kg (21h06)

Objet : Re: KAVERN - Logique de Poids (Limite 10 kg) et UX du Panier / Colis Ouvert

Bonjour André,

La gestion du poids est un sujet pertinent pour ta logistique. Voici ce que ça implique techniquement :

**Prérequis :** Chaque produit doit avoir un champ "poids" renseigné dans sa fiche admin. Sans ça, impossible de calculer le poids du colis.

**1. Jauge de poids**
Réalisable : barre de progression "X kg / 10 kg" dans le panier et le résumé du colis ouvert. Nécessite que tous les produits aient leur poids renseigné.

**2. Blocage + bascule nouveau colis**
C'est une mécanique complexe :
- Vérification du poids total à chaque ajout au panier
- Popup d'alerte si dépassement
- Clôture automatique du colis ouvert en cours
- Création d'un nouveau colis avec frais de port

C'est un développement spécifique qui n'était pas dans le périmètre initial. Je le note dans la feuille de route.

**Action immédiate de ton côté :** Commence à renseigner le poids (en kg) de chaque produit dans l'admin. Sans ça, aucune logique de poids ne fonctionnera.

Cordialement,
Grégory

---

## EMAIL 12 — Actualités/Blog SEO + Fiche Client 360° (email supplémentaire)

Objet : Re: KAVERN - Vérification back-office : Actualités/Blog + Clients

Bonjour André,

**PARTIE 1 — Blog/Actualités SEO**

- **Champs SEO (Title, Meta-description, Slug)** : ✅ En place dans l'éditeur d'articles.
- **Alt images** : ✅ Le champ texte alternatif est disponible pour les images.
- **Structure H2/H3** : ✅ L'éditeur permet la structuration des titres.

**PARTIE 2 — Fiche Client**

- **Vue centralisée** : La fiche client affiche les infos principales. L'affichage du colis ouvert en cours et du solde cagnottes directement sur la fiche est une amélioration UX que je note.
- **Ajustement manuel cagnotte** : ✅ C'est possible dans l'admin.
- **Bouton RGPD (anonymisation)** : C'est un développement spécifique (anonymisation du compte + conservation des factures anonymisées pendant 10 ans). Hors périmètre initial mais important pour la conformité.

Cordialement,
Grégory

---

## EMAIL 13 — Pages SEO, Médiathèque, Sauvegardes (email supplémentaire)

Objet : Re: KAVERN - Vérification back-office : Site, Médiathèque & Sauvegardes

Bonjour André,

**1. Open Graph (partage Facebook/WhatsApp)**
- Pages fixes : ✅ Les balises OG sont en place (titre, description, image).
- Produits : Les balises OG dynamiques (photo produit + titre + prix) sont partiellement en place. Je vais vérifier que chaque fiche produit génère bien sa carte de partage.

**2. Compression images**
Next.js intègre nativement l'optimisation d'images (composant next/image). Les images sont automatiquement redimensionnées et servies en format WebP par Vercel. Tu n'as rien à faire de spécial à l'upload.

**3. Sauvegardes**
- **Automatiques** : Supabase (notre base de données) effectue des sauvegardes automatiques quotidiennes. Les données sont répliquées.
- **Manuelles** : Tu peux exporter tes données depuis le dashboard Supabase à tout moment. Un bouton "Export" dans l'admin est une feature additionnelle.
- **Restauration** : En cas de pépin, une restauration est possible via Supabase. Ce n'est pas un bouton en un clic mais c'est faisable.

Cordialement,
Grégory
