# MISSION DIVINE — AUDIT COMPLET KAVERN

## CONTEXTE
KAVERN est un e-commerce Next.js 14 + Supabase (PostgreSQL + RLS + auth) deploy sur Vercel.
Le client (Andre) remonte des bugs en permanence. On a deja fixe :
- Trigger handle_new_user (blocked -> is_blocked)
- 7 vulnerabilites securite (Stripe price validation, XSS, CRON, upload, middleware admin)
- Cashback 2% trigger, stock manage_stock, RLS profiles/loyalty
- 24 nouveaux tests E2E (security + smoke)

## CE QU'ON VEUT
Analyse DIVINE exhaustive de tout le codebase + schema DB pour trouver :
1. TOUS les bugs restants (pages qui crashent, fonctionnalites cassees)
2. TOUTES les failles securite restantes
3. TOUTES les incoherences DB (colonnes inutilisees, FK manquantes, RLS manquantes)
4. TOUS les problemes de performance
5. TOUTES les fonctionnalites incompletes
6. Plan d'action priorise pour tout fixer

## FICHIERS FOURNIS
1. `repomix-divine-focused.xml` — Code source (API, checkout, admin, context, middleware, hooks)
2. `kavern-db-schema.json` — Schema complet DB (tables, colonnes, functions, triggers, policies, row counts)

## INSTRUCTIONS
- Analyser chaque fichier du repomix
- Croiser avec le schema DB
- Lister CHAQUE probleme avec fichier:ligne + severite + fix propose
- Produire un plan d'action en 3 phases (critique / important / nice-to-have)
