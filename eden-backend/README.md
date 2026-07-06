# Eden Backend

Backend **autonome et réutilisable** d'Eden — le tuteur de croissance de Nedexia.
Extrait du site principal pour pouvoir brancher le même Eden dans un autre projet
sans dupliquer la logique métier.

C'est une app **Next.js (App Router)** qui n'expose que des *route handlers*
(`app/api/*` + `app/auth/*`) — pas d'interface. Toute la logique vit dans `lib/`.

---

## Contenu

```
eden-backend/
├── app/
│   ├── api/
│   │   ├── eden/chat            POST  · conversation Eden (SSE, outils, mémoire)
│   │   ├── eden/demo            POST  · démo publique (sans auth, sans outils)
│   │   ├── eden/documents/analyze  POST · analyse IA d'un document
│   │   ├── diagnostic/submit    POST  · sauvegarde d'un diagnostic complété
│   │   ├── diagnostic/track     POST  · tracking anonyme du tunnel
│   │   ├── espace/score/recompute   POST · recalcul du score depuis les tâches
│   │   ├── espace/links/auto-analyze POST · analyse auto REQ + site web
│   │   ├── cron/digest          GET   · digest hebdo (Bearer CRON_SECRET)
│   │   └── admin/diagnostics/export GET · export CSV (ADMIN_DIAGNOSTIC_KEY)
│   ├── auth/callback            GET   · callback OAuth / magic link Supabase
│   └── auth/signout             GET/POST · déconnexion
├── lib/
│   ├── eden/     · cerveau d'Eden (prompt système, contexte, outils, analyse doc)
│   ├── espace/   · diagnostic, score, tâches, CRM, projets, notifications, stores
│   ├── supabase/ · clients Supabase (serveur, navigateur, admin, proxy)
│   └── email/    · envoi via Resend (digest)
├── supabase/migrations/  · schéma complet (16 migrations SQL)
└── proxy.ts      · rafraîchissement de session Supabase
```

---

## Prérequis

- Node 20+
- Un projet **Supabase** (le même que le site principal, pour partager les données)
- Une clé **OpenAI**
- (optionnel) une clé **Resend** pour les emails de suivi

---

## Démarrage

```bash
cd eden-backend
npm install
cp .env.example .env.local   # puis renseignez les valeurs
npm run dev                  # http://localhost:3000
```

`npm run typecheck` et `npm run build` valident le projet.

> Pour faire tourner ce backend **en parallèle** du site principal en local,
> lancez-le sur un autre port : `next dev -p 3001`.

---

## Variables d'environnement

Voir `.env.example`. Les essentielles :

| Variable | Rôle |
|----------|------|
| `OPENAI_API_KEY` | Appels OpenAI (chat, démo, analyse doc, résumés) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth + accès DB (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Opérations admin/cron/funnel (bypass RLS) |
| `NEXT_PUBLIC_SITE_URL` | Base pour redirections auth + liens |
| `CRON_SECRET` | Protège `/api/cron/digest` |
| `ADMIN_DIAGNOSTIC_KEY` | Protège l'export CSV admin |
| `RESEND_API_KEY` / `EDEN_FROM_EMAIL` | Emails (optionnel) |

---

## Base de données

Le schéma vit dans `supabase/migrations/`. Puisque ce backend pointe vers **le
même projet Supabase** que le site principal, les tables existent déjà : ne
rejouez **pas** les migrations sur cette base. Elles sont incluses uniquement
comme référence (et pour recréer un nouvel environnement si besoin, via
`supabase db push` ou le SQL editor).

Tables principales : `profiles`, `diagnostics`, `conversations`, `messages`,
`documents`, `tasks`, `task_events`, `projects`, `project_folders`, `contacts`,
`opportunities`, `notifications`, `eden_notes`, `score_history`,
`program_milestones`, `diagnostic_funnel`.

---

## Authentification

Eden identifie l'utilisateur via la **session Supabase** (cookies). Chaque route
protégée appelle `supabase.auth.getUser()` et renvoie `401` sans session valide.

Deux façons de brancher l'auth depuis un autre site :

1. **Même domaine / cookies partagés** — si le front et ce backend sont servis
   sous le même domaine (ex. `app.exemple.com` + `app.exemple.com/api`), la
   session Supabase est automatiquement transmise.
2. **Auth gérée par ce backend** — les routes `app/auth/callback` et
   `app/auth/signout` permettent à ce service de gérer lui-même le magic link /
   OAuth Google (configurez les URLs de redirection dans Supabase).

Le fichier `proxy.ts` rafraîchit la session à chaque requête.

---

## Brancher dans un autre site Next.js

Comme la cible est du Next.js, l'intégration est du copier-coller :

1. Copiez `lib/eden`, `lib/espace`, `lib/supabase`, `lib/email` dans le `lib/`
   de l'autre projet (gardez l'alias `@/*` → racine dans son `tsconfig.json`).
2. Copiez les dossiers de routes voulus depuis `app/api/*` et `app/auth/*`.
3. Ajoutez les dépendances manquantes (`@supabase/ssr`, `@supabase/supabase-js`,
   `unpdf`).
4. Reportez `proxy.ts` (ou fusionnez avec le proxy/middleware existant).
5. Renseignez les variables d'environnement ci-dessus.

Le front n'a plus qu'à appeler les endpoints (`POST /api/eden/chat`, etc.).

> Le seul type extrait de l'UI d'origine vit désormais dans
> `lib/espace/workspace-types.ts` (types projets/dossiers), pour que le backend
> soit 100 % indépendant de tout composant React.

---

## Notes

- Modèle OpenAI : les routes de production utilisent `gpt-5.5` (en dur dans le
  code) ; la démo lit `EDEN_DEMO_MODEL` (défaut `gpt-5.5`).
- `app/page.tsx` est une simple page de contrôle « le service tourne ».
- Ce dossier est une **copie** : le site principal continue de fonctionner tel
  quel, il n'a pas été modifié.
