#!/usr/bin/env bash
# One build → studio.elaya.io + admin.elaya.io (same SPA, two domains).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${ELAYA_VPS_HOST:-elayadev@81.173.83.158}"
KEY="${ELAYA_SSH_KEY:-$HOME/.ssh/elaya_api}"
RSYNC_SSH=(ssh -i "$KEY" -o StrictHostKeyChecking=accept-new)

if [[ ! -f "$KEY" ]]; then
  echo "❌ SSH key not found: $KEY"
  echo "   Set ELAYA_SSH_KEY or place the key at ~/.ssh/elaya_api"
  exit 1
fi

cd "$ROOT"
echo "→ Building elaya-frontend…"
npm run build

echo "→ Syncing dist → studio + admin on VPS…"
rsync -az --delete -e "${RSYNC_SSH[*]}" ./dist/ "$HOST:~/apps/elaya-studio/dist/"
rsync -az --delete -e "${RSYNC_SSH[*]}" ./dist/ "$HOST:~/apps/elaya-admin/dist/"

"${RSYNC_SSH[@]}" "$HOST" 'set -e
chmod o+x /home/elayadev /home/elayadev/apps /home/elayadev/apps/elaya-studio /home/elayadev/apps/elaya-admin
chmod -R o+rX ~/apps/elaya-studio/dist ~/apps/elaya-admin/dist
'

echo "→ Smoke checks…"
# Prefer local curl; if DNS/proxy fails on the laptop, verify from the VPS itself.
smoke_ok=0
if studio_code="$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 8 https://studio.elaya.io/ 2>/dev/null)" \
  && admin_code="$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 8 https://admin.elaya.io/ 2>/dev/null)" \
  && [[ "$studio_code" =~ ^[23] ]] && [[ "$admin_code" =~ ^[23] ]]; then
  echo "studio:${studio_code}"
  echo "admin:${admin_code}"
  smoke_ok=1
else
  echo "   Local DNS/proxy failed — checking from VPS…"
  "${RSYNC_SSH[@]}" "$HOST" 'set -e
    curl -sS -o /dev/null -w "studio:%{http_code}\n" --connect-timeout 8 https://studio.elaya.io/
    curl -sS -o /dev/null -w "admin:%{http_code}\n" --connect-timeout 8 https://admin.elaya.io/
  ' && smoke_ok=1
fi

if [[ "$smoke_ok" -ne 1 ]]; then
  echo "❌ FAILED: smoke checks"
  exit 1
fi

echo "✅ SUCCESS: elaya-frontend → studio.elaya.io + admin.elaya.io"
