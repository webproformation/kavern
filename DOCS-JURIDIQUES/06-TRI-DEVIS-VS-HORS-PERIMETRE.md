# TRI DES DEMANDES : PÉRIMÈTRE CONTRACTUEL vs HORS DEVIS

Le devis initial (202511-10000071) prévoyait un **site e-commerce classique** type WooCommerce :
catalogue produits, panier, checkout, paiement Stripe/PayPal, livraison, admin basique.

Le devis KAVERN (202603-10000081) couvrait le rebranding + ajustements.

---

## ✅ DANS LE PÉRIMÈTRE (bugs à corriger, maintenance normale)

| # | Demande | Justification |
|---|---------|---------------|
| 1 | Bug stock produits variables "Épuisé" | Bug d'affichage — maintenance corrective |
| 2 | Bouton "Je craque" grisé pour variables | Bug UX — comportement attendu cassé |
| 3 | Dépassement stock panier | Bug — le contrôle existe mais ne bloque pas le "+" |
| 4 | Mise à jour templates emails existants | Contenu fourni par le client — personnalisation normale |
| 5 | Min 10€ après déductions | Ajustement d'une règle existante |
| 6 | Texte footer "Vite chez vous" | Modif texte simple |
| 7 | Open Graph produits | Partiellement en place, vérification |
| 8 | Compression images WebP | Natif Next.js/Vercel — déjà actif |
| 9 | Sauvegardes auto | Natif Supabase — déjà actif |
| 10 | SEO blog (Title, Meta, Slug, Alt, H2/H3) | Déjà en place |

---

## ❌ HORS PÉRIMÈTRE CONTRACTUEL (développements spécifiques nouveaux)

### Catégorie 1 : Module Facturation & Comptabilité avancé
*Un site e-commerce classique génère des reçus, pas un système comptable complet.*

| # | Demande | Estimation | Valeur marché |
|---|---------|-----------|---------------|
| 1 | Numérotation séquentielle FAV-2026-XXXX inviolable | 1 jour | 500 € |
| 2 | Ventilation TVA multi-taux sur factures PDF | 1 jour | 500 € |
| 3 | Module Avoirs complet (AVO-XXXX, numérotation, PDF, remise stock) | 3 jours | 1 500 € |
| 4 | Export comptable CSV avec filtrage par période | 0.5 jour | 300 € |
| 5 | Export inventaire CSV (Nom, UGS, Qté, Prix achat HT) | 0.5 jour | 300 € |

### Catégorie 2 : Live Shopping & Anti-fraude
*Le devis prévoyait un site de vente en ligne, PAS une plateforme de live shopping avec réservation temps réel.*

| # | Demande | Estimation | Valeur marché |
|---|---------|-----------|---------------|
| 6 | Panier Live avec réservation 24h + remise en stock auto (cron) | 3 jours | 1 500 € |
| 7 | Système "3 strikes" anti-fraude automatique | 2 jours | 1 000 € |
| 8 | Badge "Nouveau" client dans interface live admin | 0.5 jour | 300 € |
| 9 | Bascule colis ouvert au paiement (cas expiration pendant réservation) | 1 jour | 500 € |

### Catégorie 3 : Logique de poids & logistique avancée
*Fonctionnalité de gestion logistique, pas un standard e-commerce.*

| # | Demande | Estimation | Valeur marché |
|---|---------|-----------|---------------|
| 10 | Jauge de poids panier + colis ouvert (X kg / 10 kg) | 1 jour | 500 € |
| 11 | Blocage 10 kg + popup + bascule auto nouveau colis | 2 jours | 1 000 € |

### Catégorie 4 : Optimisations Admin avancées
*Au-delà d'un back-office standard de gestion de produits.*

| # | Demande | Estimation | Valeur marché |
|---|---------|-----------|---------------|
| 12 | Accordéons repliables formulaire produit | 0.5 jour | 300 € |
| 13 | Badges marketing dropdown + affichage visuel catalogue | 1 jour | 500 € |
| 14 | Édition rapide stock inline (clic sur badge + popup variantes) | 1 jour | 500 € |
| 15 | Actions groupées bulk (cases à cocher, publier/supprimer en masse) | 2 jours | 1 000 € |
| 16 | Fiche client 360° (historique + colis ouvert + cagnottes en un écran) | 1 jour | 500 € |

### Catégorie 5 : Livraisons & Retours avancés
*L'intégration Sendcloud basique était au devis, pas la carte interactive ni les avoirs automatiques.*

| # | Demande | Estimation | Valeur marché |
|---|---------|-----------|---------------|
| 17 | Carte interactive Point Relais (API Mondial Relay avec géolocalisation) | 3 jours | 1 500 € |
| 18 | Gestion retours SAV (remise stock auto + avoir comptable auto) | 2 jours | 1 000 € |

### Catégorie 6 : Sécurité financière & règles métier
*Règles métier spécifiques à KAVERN, pas des standards e-commerce.*

| # | Demande | Estimation | Valeur marché |
|---|---------|-----------|---------------|
| 19 | Non-cumul code promo + cagnotte (exclusion mutuelle) | 0.5 jour | 300 € |
| 20 | Bouton RGPD anonymisation client (droit à l'oubli + conservation factures 10 ans) | 2 jours | 1 000 € |

### Catégorie 7 : Sauvegardes & Outils admin
*Au-delà du standard Supabase.*

| # | Demande | Estimation | Valeur marché |
|---|---------|-----------|---------------|
| 21 | Bouton sauvegarde manuelle + restauration depuis admin | 1 jour | 500 € |

---

## RÉCAPITULATIF FINANCIER

| Catégorie | Jours | Valeur marché |
|-----------|-------|---------------|
| Facturation & Compta | 6 jours | 3 100 € |
| Live Shopping & Anti-fraude | 6.5 jours | 3 300 € |
| Logique de poids | 3 jours | 1 500 € |
| Optimisations Admin | 5.5 jours | 2 800 € |
| Livraisons & Retours | 5 jours | 2 500 € |
| Sécurité financière | 2.5 jours | 1 300 € |
| Sauvegardes | 1 jour | 500 € |
| **TOTAL NOUVELLES DEMANDES** | **~29.5 jours** | **~15 000 €** |

### Cumul total du travail hors périmètre

| | Montant |
|---|---------|
| Travail supplémentaire déjà réalisé gratuitement (doc 02) | 26 800 € |
| Nouvelles demandes du 27/03/2026 | 15 000 € |
| **TOTAL travail hors contrat** | **~41 800 €** |
| Montant total facturé (2 devis) | 8 500 € |
| Montant impayé | 2 850 € |

Le client demande **41 800 € de travail supplémentaire** tout en ayant **2 850 € d'impayés**.

---

*Date : 27 mars 2026*
*Grégory DEMEULENAERE — Web Pro Formation*
