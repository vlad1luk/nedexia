# Eden Kit — à copier dans ton autre projet Next.js

Ce dossier contient **uniquement** les fichiers à fusionner dans un autre projet.
Rien ici ne remplace ton `package.json`, `tsconfig` ou `next.config` existants.

Le site principal (`web-site/`) n'a pas été modifié — ce sont des **copies**.

---

## Copie rapide

Depuis la racine de ton **nouveau** projet Next.js :

```bash
# 1. Logique métier + Supabase + email
cp -R eden-kit/lib/eden   ./lib/
cp -R eden-kit/lib/espace ./lib/
cp -R eden-kit/lib/supabase ./lib/
cp -R eden-kit/lib/email  ./lib/

# 2. Routes API Eden
cp -R eden-kit/app/api/eden       ./app/api/
cp -R eden-kit/app/api/diagnostic ./app/api/
cp -R eden-kit/app/api/espace     ./app/api/
cp -R eden-kit/app/api/cron       ./app/api/      # optionnel — digest hebdo
cp -R eden-kit/app/api/admin      ./app/api/      # optionnel — export CSV admin

# 3. Auth Supabase (magic link + Google)
cp -R eden-kit/app/auth/callback ./app/auth/
cp -R eden-kit/app/auth/signout  ./app/auth/

# 4. Proxy session (fusionne si tu en as déjà un)
cp eden-kit/proxy.ts ./proxy.ts
```

---

## Dépendances à ajouter dans ton projet

```bash
npm install @supabase/ssr @supabase/supabase-js unpdf
```

---

## Variables d'environnement

Copie les valeurs depuis ton site actuel (même projet Supabase) :

```bash
cp eden-kit/.env.example .env.local
# puis remplis avec tes clés existantes
```

Essentiel : `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.

---

## tsconfig

Ton `tsconfig.json` doit avoir l'alias :

```json
"paths": {
  "@/*": ["./*"]
}
```

---

## Contenu du kit

| Dossier | Rôle |
|---------|------|
| `lib/eden/` | Cerveau d'Eden (prompt, contexte, outils, analyse docs) |
| `lib/espace/` | Diagnostic, score, tâches, CRM, projets, stores |
| `lib/supabase/` | Clients Supabase (serveur, client, admin, proxy) |
| `lib/email/` | Envoi Resend (digest) |
| `app/api/eden/` | Chat, démo, analyse documents |
| `app/api/diagnostic/` | Soumission + tracking tunnel |
| `app/api/espace/` | Recalcul score, auto-analyse liens |
| `app/api/cron/` | Digest hebdomadaire (optionnel) |
| `app/api/admin/` | Export CSV diagnostics (optionnel) |
| `app/auth/` | Callback OAuth + déconnexion |
| `proxy.ts` | Rafraîchissement session Supabase |

**Pas inclus** (inutile pour toi) : migrations SQL (ta base existe déjà), UI, pages marketing.

---

## Endpoints disponibles après copie

| Route | Méthode | Auth |
|-------|---------|------|
| `/api/eden/chat` | POST | Oui |
| `/api/eden/demo` | POST | Non |
| `/api/eden/documents/analyze` | POST | Oui |
| `/api/diagnostic/submit` | POST | Oui |
| `/api/diagnostic/track` | POST | Non |
| `/api/espace/score/recompute` | POST | Oui |
| `/api/espace/links/auto-analyze` | POST | Oui |
| `/api/cron/digest` | GET | Bearer `CRON_SECRET` |
| `/api/admin/diagnostics/export` | GET | Clé admin |
| `/auth/callback` | GET | — |
| `/auth/signout` | GET/POST | — |

---

## Vérification

```bash
npm run build
```

Si le build passe, ton nouveau front peut appeler `POST /api/eden/chat` comme avant.
