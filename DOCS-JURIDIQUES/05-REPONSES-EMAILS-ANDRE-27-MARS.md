# RÉPONSES AUX 35 EMAILS D'ANDRÉ — 27/28 MARS 2026

Toutes les demandes ont été traitées. Voici le statut de chaque point.

---

EMAIL 1 — Module Facturation et Comptabilité

1. Numérotation séquentielle : Fait. Table invoices créée avec numérotation FAV-2026-0001 automatique (trigger en base). Impossible de supprimer une facture (obligation légale).
2. PDF avec mentions légales KAVERN : Fait. KAVERN SASU, capital 1 000 €, SIREN 102 355 443, TVA FR37102355443, RCS Dunkerque.
3. Ventilation TVA multi-taux : Fait. Tableau détaillé sur la facture PDF (Base HT, Montant TVA, TTC par taux). Chaque produit a son taux configurable dans l'admin.
4. Système d'Avoirs : Fait. Numérotation AVO-2026-0001 avec séquence indépendante. Hors périmètre initial.
5. Export Comptable CSV : Fait. Bouton "Export Comptable" dans la page Commandes. Colonnes : Date, N° Commande, HT, TVA, TTC. Uniquement les commandes payées. Hors périmètre initial.

---

EMAIL 2 — Email de Bienvenue

Fait. Template intégré avec ton texte. Bloc 5 € BIENVENUE5 en noir et or. Mentions Colis Ouvert et Cagnotte. Envoi automatique à chaque inscription. SMTP O2switch configuré (contact@kavern-france.fr).

---

EMAIL 3 — Email Post-Achat (Demande d'avis)

Fait. Cron job ajusté à 3-5 jours après le statut "Livré". Condition d'exclusion : l'email ne part pas si la cliente a déjà posté un avis pour cette commande. Template mis à jour avec ton texte (Livre d'Or + 0,20 € cagnotte).

---

EMAIL 4 — Email Confirmation de Commande

Fait. Récapitulatif des articles avec images. Affichage conditionnel : Option A (expédition classique sous 24-48h) ou Option B (Colis Ouvert avec rappel des 7 jours). Envoi automatique après validation du paiement.

---

EMAIL 5 — Email d'Expédition du Colis

Fait. Template avec nom du transporteur dynamique et lien de suivi. Envoi automatique quand tu passes une commande en statut "Expédié" dans l'admin. Le lien de suivi sera renseigné automatiquement via Sendcloud quand tu auras activé ton abonnement et fourni les clés API.

---

EMAIL 6 — Modification "Vite chez vous"

Fait. Prix retiré de la page ET du footer. Le texte affiche maintenant : "Vos pépites emballées avec soin et une expédition rapide."

---

EMAIL 7 — Stocks Live, Anti-fraude et Logistique Colis Ouvert

PARTIE 1 — Panier Live 24h : Fait. Cron job toutes les heures qui vide les paniers live de plus de 24h et remet le stock en place automatiquement. Hors périmètre initial.

PARTIE 2 — Sécurité et 3 Strikes : Fait. Badge "Nouveau" visible dans la liste clients admin. Compteur de strikes par client. Après 3 paniers live expirés sans paiement, la réservation différée est bloquée automatiquement. Hors périmètre initial.

PARTIE 3 — Bascule Colis Ouvert : Fait. La logique fonctionne au moment du paiement. Le colis ouvert ne peut plus être créé "à vide" depuis le profil — il s'ouvre uniquement au checkout.

PARTIE 4 — Admin Colis Ouvert : Fait. Onglet "Colis ouverts en cours" opérationnel. Compte à rebours 7 jours. Bon de préparation. Jauge de poids (X kg / 10 kg). Bouton "Clôturer et expédier". Pour les étiquettes Sendcloud : en attente de tes clés API.

---

EMAIL 8 — Fidélité, Gamification et Livre d'Or

1. Séparation Livre d'Or vs Avis Produits : Confirmé et vérifié. Seul le Livre d'Or donne 0,20 €. Les avis sur les fiches produits ne rapportent rien.
2. Automatisation du gain : Fait. Quand tu cliques "Approuver" dans le Livre d'Or, les 0,20 € sont crédités automatiquement sur la cagnotte de la cliente (avec vérification anti-doublon).
3. Rangs et Multiplicateurs : En place. Esprit Curieux (x1), Passionné (x2), Collectionneur (x3). Le passage est calculé automatiquement par la base de données.
4. Modification manuelle : Oui, possible dans l'admin depuis la fiche client.

---

EMAIL 9 — Bugs critiques d'inventaire et Optimisations UX

PARTIE 1 — Bugs : Tous corrigés.
- Affichage "Épuisé" sur produits variables : corrigé (le stock parent est maintenant la somme des variantes).
- Bouton "Je craque" grisé : corrigé (affiche "Choisir ma pépite" et redirige vers la fiche produit).
- Dépassement de stock panier : corrigé (le "+" se bloque au stock disponible avec message d'erreur).

PARTIE 2 — Optimisations Admin (toutes hors périmètre, toutes réalisées) :
- Export inventaire CSV : Fait. Bouton vert dans la liste produits.
- Accordéons formulaire : Fait. Sections repliables (SEO et Options fermées par défaut).
- Badges marketing : Fait. Dropdown dans les options produit + affichage visuel sur le catalogue.
- Édition rapide stock : Fait. Clic sur le badge stock dans la liste = input direct.
- Actions groupées : Opérationnel (publier, supprimer, privé live en masse).

---

EMAIL 10 — Minimum de commande, Non-cumul et Livraisons

1. Minimum 10 € final : Fait. S'applique sur le montant net à payer (après déduction cagnottes et coupons). Message explicatif si le seuil n'est pas atteint.
2. Non-cumul BIENVENUE5 + Cagnotte : Fait. Code promo et cagnotte sont mutuellement exclusifs. L'un grise l'autre au checkout. Message "Une seule réduction par commande".
3. Carte interactive Point Relais : Déjà développée (composant RelayPointSelector + API Mondial Relay + Google Maps). En attente des clés API pour activation.
4. Étiquettes Sendcloud : En attente de tes clés API.
5. Gestion retours : Module avoirs développé (voir email 1).

---

EMAIL 11 — Logique de Poids 10 kg

Fait. Jauge de poids visuelle dans la page "Mes Colis Ouverts" (X kg / 10 kg avec barre de progression). Vérification du poids max au checkout. Action de ton côté : renseigner le poids de chaque produit dans l'admin pour que la jauge affiche les bonnes valeurs. Hors périmètre initial.

---

EMAIL 12 — Actualités/Blog SEO + Fiche Client

Blog/Actualités SEO : Champs Title, Meta-description, Slug, Alt images, structure H2/H3 — tout est en place dans l'éditeur d'articles.

Fiche Client : Vue centralisée opérationnelle. Badge "Nouveau" et compteur de strikes visibles. Ajustement manuel de la cagnotte possible. Bouton RGPD "Supprimer mon compte" ajouté dans l'espace client (anonymisation + conservation factures 10 ans). Hors périmètre initial.

---

EMAIL 13 — Pages SEO, Médiathèque, Sauvegardes

1. Open Graph : Fait. Chaque produit génère automatiquement une carte de partage avec photo, titre et description pour Facebook/WhatsApp.
2. Compression images : Natif. Next.js/Vercel optimise et sert automatiquement les images en WebP.
3. Sauvegardes : Automatiques quotidiennes via Supabase. Export manuel possible depuis le dashboard Supabase.

---

EMAIL 14 — Bug page "Mes Coupons"

Corrigé. Le bug venait d'une incompatibilité entre les noms de colonnes en base de données et l'affichage. La page fonctionne maintenant.

---

EMAIL 15 — Cartes Cadeaux (mécanique financière)

Les 3 points sont opérationnels :
1. Reliquat automatique : le solde restant est conservé sur le même code.
2. Paiement partagé : la carte déduit ce qu'elle peut, le reste se paye par CB/PayPal.
3. Attribution des cartes reçues : liées à l'email du destinataire. Visible dans l'onglet "Cartes reçues" si la destinataire se connecte avec le même email.

---

EMAIL 16 — Adresses et Colis Ouvert

1. Modification d'adresse pendant un Colis Ouvert : L'adresse est verrouillée à la création du colis. Une modification ultérieure du profil n'affecte pas le colis en cours.
2. Facturation / Livraison : Fait. Checkbox "Utiliser une adresse de facturation différente" ajoutée au checkout (pour les cadeaux). Hors périmètre initial.

---

EMAIL 17 — Anti-cumul Parrainage + Bienvenue

Non-cumul : Fait. Une seule réduction par commande. Code promo et cagnotte mutuellement exclusifs.
Anti-auto-parrainage : Fait. Le système vérifie que le code n'appartient pas à l'utilisateur lui-même ET que le parrain et le filleul n'ont pas la même adresse postale.

---

EMAILS 18-27 — Contenu pages légales, page Live, sécurité client

Pages légales (CGV, Mentions Légales, RGPD, Colis Ouvert, Retours, Livraison, Paiement, Qui sommes-nous) : Toutes mises à jour avec les textes fournis. Nouvelle page "Retours et Remboursements" créée.

Page Live : Refonte complète avec Hero Header + countdown dynamique + 3 colonnes concept + FAQ accordéon + texte SEO complet avec tes textes.

Sécurité client : Date de naissance verrouillée (anti-fraude anniversaire). Bouton RGPD "Supprimer mon compte" ajouté. Code BIENVENUE5 vérifié par adresse et téléphone.

---

EMAILS 28-35 — Checkout, persistance panier, documents PDF, tests

Checkout : Case CGV + RGPD obligatoire combinée. Bouton toujours actif visuellement. Assurance livraison supprimée. Paiement renommé "en boutique".
Persistance panier mobile : Corrigé (rechargement automatique au réveil du téléphone).
Documents PDF techniques : Module complet. Upload dans l'admin + affichage sur la fiche produit avec boutons de téléchargement. Section masquée si aucun document.
Onglet Composition : Ajouté sur la fiche produit (affiché si le champ est rempli).
Tirage au sort : Animation 30 secondes avec countdown géant + ralentissement progressif + bouton Relancer. Hors périmètre initial.
Notifications Push : Service worker + bouton d'activation + sauvegarde en base. Hors périmètre initial.
