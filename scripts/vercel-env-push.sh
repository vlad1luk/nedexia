#!/usr/bin/env bash
# Pousse toutes les variables de .env vers Vercel (production + preview + development).
# Usage : depuis la racine du projet
#   bash scripts/vercel-env-push.sh
#   bash scripts/vercel-env-push.sh .env.local
#
# Prérequis : vercel login && vercel link (déjà fait si .vercel/ existe)

set -euo pipefail

ENV_FILE="${1:-.env}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Fichier introuvable : $ENV_FILE"
  exit 1
fi

if ! command -v vercel >/dev/null; then
  echo "Installez la CLI : npm i -g vercel"
  exit 1
fi

echo "Projet : $(pwd)"
echo "Source : $ENV_FILE"
echo ""

count=0
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line//[[:space:]]/}" ]] && continue

  key="${line%%=*}"
  key="${key//[[:space:]]/}"
  value="${line#*=}"
  value="${value#"${value%%[![:space:]]*}"}"

  [[ -z "$key" || -z "$value" ]] && continue

  echo "→ $key"
  vercel env add "$key" production preview development \
    --value "$value" \
    --force \
    --yes \
    --non-interactive
  count=$((count + 1))
done < "$ENV_FILE"

echo ""
echo "Terminé : $count variable(s) poussée(s) vers Vercel."
echo ""
echo "Important : vérifiez NEXT_PUBLIC_SITE_URL en production"
echo "  (ex. https://votre-projet.vercel.app, pas localhost)."
echo "  vercel env ls"
echo "  puis redeploy : vercel --prod"
