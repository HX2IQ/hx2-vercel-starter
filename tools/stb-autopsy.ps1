param(
  [string]$Base = "https://optinodeiq.com",
  [string]$Vps  = "root@ap2-worker.optinodeiq.com",
  [int]$Tail    = 120
)

$ErrorActionPreference = "Stop"

function Say($s){ Write-Host "`n=== $s ===" -ForegroundColor Cyan }

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

Say "1) Vercel/API quick health probes"
try {
  $r = Invoke-WebRequest -Uri "$Base/api/hx2_base?ts=$ts" -Method Get -SkipHttpErrorCheck
  "hx2_base: {0}  vercel-id={1}  cache={2}" -f $r.StatusCode, (($r.Headers["x-vercel-id"]) -join ","), (($r.Headers["x-vercel-cache"]) -join ",")
} catch { "hx2_base probe failed: $($_.Exception.Message)" }

try {
  $r = Invoke-WebRequest -Uri "$Base/api/ap2/redis/ping?ts=$ts" -Method Get -SkipHttpErrorCheck
  "redis ping: {0}" -f $r.StatusCode
} catch { "redis ping failed: $($_.Exception.Message)" }

Say "2) Enqueue AP2 ping + poll (uses existing smoke script if present)"
if (Test-Path ".\tools\smoke-ap2.ps1") {
  .\tools\smoke-ap2.ps1
} else {
  Write-Host "Missing .\tools\smoke-ap2.ps1 — skipping enqueue/poll." -ForegroundColor Yellow
}

Say "3) VPS truth-source bundle (listeners, pm2, env, logs)"
$bash = @"
set -euo pipefail
echo '== listeners (80/443 + 3800/3802/3805/3901) =='
ss -ltnp | egrep ':(80|443|3800|3802|3805|3901)\s' || true
echo
echo '== pm2 list =='
pm2 list || true
echo
echo '== pm2 env: ap2-worker (id 2) redis+hx2+brain =='
pm2 env 2 2>/dev/null | egrep 'UPSTASH_|REDIS_|HX2_|BRAIN_' || true
echo
echo '== ap2-worker OUT tail =='
tail -n $Tail /root/.pm2/logs/ap2-worker-out.log 2>/dev/null || true
echo
echo '== ap2-worker ERR tail =='
tail -n $Tail /root/.pm2/logs/ap2-worker-error.log 2>/dev/null || true
echo
echo '== ap2-gateway OUT tail =='
tail -n $Tail /root/.pm2/logs/ap2-gateway-out.log 2>/dev/null || true
echo
echo '== ap2-gateway ERR tail =='
tail -n $Tail /root/.pm2/logs/ap2-gateway-error.log 2>/dev/null || true
"@

$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($bash))
ssh $Vps "echo $b64 | base64 -d | bash"

Say "4) Heuristic verdict hints (read this section)"
Write-Host @"
If tasks stay ENQUEUED:
  - Look for callback 401/403 in ap2-worker-out.log (auth mismatch)
  - Look for ioredis ENOENT / connection errors (bad REDIS_URL / quotes / whitespace)
  - Confirm worker is actually running (pm2 list) and has correct env (pm2 env 2)

If brain.status fails:
  - Confirm listener exists on expected port (ss -ltnp shows 3805)
  - Ensure BRAIN_URL and BRAIN_SHELL_URL point to the same reachable base
"@ -ForegroundColor Gray
