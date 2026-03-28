# ACTIONS ANDRÉ — AVANT LE LANCEMENT

## ÉTAPE 1 : Paiements & Accès (BLOQUANT)

| # | Action | Comment faire | Bloquant pour |
|---|--------|--------------|---------------|
| 1 | **Régler le solde du devis KAVERN : 1 350 € HT** | Virement sur le compte de Web Pro Formation | Transfert de propriété du site |
| 2 | **Fournir les clés Stripe LIVE** | Dashboard Stripe → Developers → API Keys → copier la clé publique (pk_live_...) et secrète (sk_live_...) | Paiements par carte bancaire réels |
| 3 | **Activer Stripe en mode LIVE** | Dashboard Stripe → activer le mode production (sortir du mode test) | idem |

## ÉTAPE 2 : Sendcloud (BLOQUANT pour l'expédition)

| # | Action | Comment faire |
|---|--------|--------------|
| 4 | **Activer l'abonnement Sendcloud Lite** | app.sendcloud.com → Mon Compte → Abonnement → Activer (33€ HT/mois) |
| 5 | **Configurer le prélèvement** | app.sendcloud.com → Facturation → Ajouter moyen de paiement (virement 0,02€ anti-fraude) |
| 6 | **Renseigner les adresses** | app.sendcloud.com → Réglages → Mes adresses → Adresse d'expédition + retour + facturation |
| 7 | **Personnaliser la marque** | app.sendcloud.com → Réglages → Marques → Logo KAVERN + couleurs |
| 8 | **Fournir les clés API** | app.sendcloud.com → Réglages → Integrations → API Keys → Créer "KAVERN" → copier Public Key + Secret Key |
| 9 | **Fournir les clés Mondial Relay** | Depuis Sendcloud → section transporteurs → activer Mondial Relay → copier MONDIAL_RELAY_ID et MONDIAL_RELAY_KEY |

## ÉTAPE 3 : Contenu produits (IMPORTANT)

| # | Action | Comment faire |
|---|--------|--------------|
| 11 | **Renseigner le poids de chaque produit** | Admin KAVERN → Produits → Modifier chaque produit → Champ "Poids (g)" → Saisir le poids en grammes |
| 12 | **Ajouter les compositions** | Admin → Produits → Modifier → Champ "Composition" (ingrédients bougies, savons, cosmétiques) |
| 13 | **Uploader les fiches techniques PDF** | Admin → Produits → Modifier → Section "Documents techniques" → Ajouter titre + URL du PDF (uploader d'abord dans la Médiathèque) |
| 14 | **Attribuer les badges marketing** | Admin → Produits → Modifier → Section Options → "Badge Marketing" → choisir (Édition limitée, Coup de cœur, Best-seller, Exclu Live, Nouveau) |
| 15 | **Vérifier les taux de TVA** | Admin → Produits → Modifier → Champ "TVA" → 20% pour bougies/accessoires, 5.5% pour épicerie |
| 16 | **Vérifier les photos** | S'assurer que les photos sont au format carré ou portrait (ratio 4:5 idéal), bonne résolution |

## ÉTAPE 4 : Test avant ouverture

| # | Action | Comment faire |
|---|--------|--------------|
| 17 | **Passer une commande test** | Avec les clés Stripe LIVE, faire un achat de 1€ → vérifier email confirmation + facture PDF |
| 18 | **Tester le virement** | Passer une commande par virement → vérifier que le RIB s'affiche sur la page confirmation |
| 19 | **Tester le colis ouvert** | Passer 2 commandes en 2 jours → la 2e avec "Ajouter au colis ouvert" → vérifier frais à 0€ |
| 20 | **Tester un live privé** | Admin → Live Shopping → Créer un live test → Configurer OBS → Lancer en privé |
| 21 | **Vérifier les emails** | Créer un compte test → vérifier l'email de bienvenue → passer commande → vérifier confirmation |

## ÉTAPE 5 : Clé Google Maps (OPTIONNEL mais recommandé)

| # | Action | Comment faire |
|---|--------|--------------|
| 22 | **Clé Google Maps** | console.cloud.google.com → Créer un projet → Activer "Maps JavaScript API" → Créer une clé API → la fournir (pour la carte interactive Point Relais) |

---

## RÉSUMÉ

**Obligatoire avant ouverture :** Actions 1 à 9 (paiement solde, Stripe, Sendcloud)
**Recommandé avant ouverture :** Actions 10 à 16 (contenu produits)
**Avant le premier vrai live :** Actions 17 à 21 (tests)

**Sans les actions 1 à 9, le site ne peut pas fonctionner en production.**
