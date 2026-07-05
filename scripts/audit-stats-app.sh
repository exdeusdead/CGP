#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/CGP"
APP="$HOME/RainbowSixCubaStats"
OUT="$ROOT/audits/apps/stats"
STAMP="$(date +%Y%m%d-%H%M%S)"
REPORT="$OUT/Stats-App-Audit-$STAMP.md"

mkdir -p "$OUT"

{
echo "# RainbowSixCubaStats App Audit"
echo
echo "Generated: $(date -Iseconds)"
echo "App Path: $APP"
echo

echo "## 1. PM2 Status"
echo '```text'
pm2 status RainbowSixCubaStats || true
echo '```'
echo

echo "## 2. Top-Level Files"
echo '```text'
find "$APP" -maxdepth 2 -type f | sort || true
echo '```'
echo

echo "## 3. Directory Tree"
echo '```text'
find "$APP" -maxdepth 3 -type d | sort || true
echo '```'
echo

echo "## 4. Package Scripts"
echo '```json'
cat "$APP/package.json" 2>/dev/null || true
echo '```'
echo

echo "## 5. JS Entry Points"
echo '```text'
find "$APP" -maxdepth 3 -type f \( -name "*.js" -o -name "*.mjs" -o -name "*.cjs" \) | sort || true
echo '```'
echo

echo "## 6. API / Provider References"
echo '```text'
grep -R "tracker\\|ubisoft\\|faceit\\|steam\\|riot\\|axios\\|fetch\\|api" "$APP" -n 2>/dev/null | head -250 || true
echo '```'
echo

echo "## 7. Database / Storage References"
echo '```text'
grep -R "sqlite\\|mysql\\|postgres\\|mongodb\\|mongoose\\|sequelize\\|prisma\\|db\\|database\\|storage\\|json" "$APP" -n 2>/dev/null | head -250 || true
echo '```'
echo

echo "## 8. Discord References"
echo '```text'
grep -R "discord\\|Client\\|GatewayIntentBits\\|interaction\\|slash\\|guild\\|channel" "$APP" -n 2>/dev/null | head -250 || true
echo '```'
echo

echo "## 9. Scheduler / Cron References"
echo '```text'
grep -R "cron\\|schedule\\|setInterval\\|setTimeout\\|queue\\|worker" "$APP" -n 2>/dev/null | head -250 || true
echo '```'
echo

echo "## 10. Environment Variables"
echo '```text'
grep -R "process.env" "$APP" -n 2>/dev/null | head -200 || true
echo '```'
echo

echo "## 11. TODO / FIXME"
echo '```text'
grep -R "TODO\\|FIXME\\|Backlog\\|v0.2" "$APP" -n 2>/dev/null | head -200 || true
echo '```'
echo

echo "## 12. Recent PM2 Logs"
echo '```text'
pm2 logs RainbowSixCubaStats --lines 60 --nostream || true
echo '```'
echo

} > "$REPORT"

ln -sfn "$REPORT" "$OUT/latest.md"

echo "Audit created:"
echo "$REPORT"
echo
echo "Latest:"
echo "$OUT/latest.md"
