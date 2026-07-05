#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/CGP"
BOT="$HOME/RainbowSixCubaBot"
OUT="$ROOT/audits/runtime"
STAMP="$(date +%Y%m%d-%H%M%S)"
REPORT="$OUT/Runtime-Audit-$STAMP.md"

mkdir -p "$OUT"

{
echo "# CGP Runtime Audit"
echo
echo "Generated: $(date -Iseconds)"
echo "Bot Path: $BOT"
echo

echo "## 1. PM2 Status"
echo '```text'
pm2 status || true
echo '```'
echo

echo "## 2. Engine Registry"
echo '```js'
sed -n '1,140p' "$BOT/core/engineRegistry.js" || true
echo '```'
echo

echo "## 3. Services Directory"
echo '```text'
find "$BOT/services" -maxdepth 2 -type d | sort || true
echo '```'
echo

echo "## 4. Engine Files"
echo '```text'
find "$BOT/services" -maxdepth 3 -name "engine.js" | sort || true
echo '```'
echo

echo "## 5. Public Engine Methods"
echo '```text'
for f in $(find "$BOT/services" -maxdepth 3 -name "engine.js" | sort); do
  echo "--- $f"
  grep -n "^[[:space:]]*[a-zA-Z0-9_]*(.*) {" "$f" || true
done
echo '```'
echo

echo "## 6. Storage Collections"
echo '```text'
find "$BOT/data/storage/records" -maxdepth 1 -type d -printf "%f\n" | sort || true
echo '```'
echo

echo "## 7. Storage JSON Counts"
echo '```text'
for d in "$BOT"/data/storage/records/*; do
  [ -d "$d" ] || continue
  count=$(find "$d" -maxdepth 1 -type f -name "*.json" | wc -l)
  echo "$(basename "$d"): $count"
done | sort
echo '```'
echo

echo "## 8. MediaOS Files"
echo '```text'
find "$BOT/services/mediaOS" -maxdepth 3 -type f | sort || true
echo '```'
echo

echo "## 9. Competition Files"
echo '```text'
find "$BOT/services/competitionEngine" -maxdepth 3 -type f | sort || true
echo '```'
echo

echo "## 10. Identity Files"
echo '```text'
find "$BOT/services/identityEngine" -maxdepth 3 -type f | sort || true
echo '```'
echo

echo "## 11. Website Files"
echo '```text'
find "$BOT/services/websiteEngine" -maxdepth 3 -type f | sort || true
echo '```'
echo

echo "## 12. Route / Server References"
echo '```text'
grep -R "listen\\|express\\|router\\|app.get\\|app.post" "$BOT/services" "$BOT/core" -n 2>/dev/null | head -200 || true
echo '```'
echo

echo "## 13. Discord Interaction References"
echo '```text'
grep -R "customId\\|slash\\|interaction\\|commands" "$BOT/services" "$BOT" -n 2>/dev/null | head -250 || true
echo '```'
echo

echo "## 14. TODO / FIXME"
echo '```text'
grep -R "TODO\\|FIXME\\|Backlog\\|v0.2" "$BOT/services" "$BOT/core" "$ROOT/docs" -n 2>/dev/null | head -200 || true
echo '```'
echo

echo "## 15. Recent Logs"
echo '```text'
pm2 logs RainbowSixCubaBot --lines 40 --nostream || true
echo '```'
echo

} > "$REPORT"

ln -sfn "$REPORT" "$OUT/latest.md"

echo "Audit created:"
echo "$REPORT"
echo
echo "Latest:"
echo "$OUT/latest.md"
