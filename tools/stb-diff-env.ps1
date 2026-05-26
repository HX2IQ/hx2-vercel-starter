param(
  [string]$Vps = "root@ap2-worker.optinodeiq.com",
  [int]$Pm2Id = 2
)

$ErrorActionPreference = "Stop"

function Parse-DotEnvText {
  param([string]$Text)
  $map = @{}
  $Text -split "`n" | ForEach-Object {
    $line = ($_ -replace "`r","").Trim()
    if (-not $line) { return }
    if ($line.StartsWith("#")) { return }
    if ($line -notmatch "=") { return }

    $k = $line.Substring(0, $line.IndexOf("=")).Trim()
    $v = $line.Substring($line.IndexOf("=")+1).Trim()

    # strip surrounding quotes only (do not touch inner chars)
    if (($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'"))) {
      $v = $v.Substring(1, $v.Length-2)
    }

    if ($k) { $map[$k] = $v }
  }
  return $map
}

function Parse-Pm2EnvText {
  param([string]$Text)
  $map = @{}
  $Text -split "`n" | ForEach-Object {
    $line = ($_ -replace "`r","").Trim()
    if (-not $line) { return }
    # lines look like: KEY: value
    if ($line -match "^([A-Z0-9_]+):\s*(.*)$") {
      $k = $Matches[1].Trim()
      $v = $Matches[2].Trim()
      $map[$k] = $v
    }
  }
  return $map
}

Write-Host "== pulling .env + pm2 env $Pm2Id from VPS ==" -ForegroundColor Cyan

$bash = @"
set -euo pipefail
cd /opt/ap2-worker
echo '---DOTENV---'
if [ -f .env ]; then cat .env; else echo 'NO_ENV_FILE'; fi
echo '---PM2ENV---'
pm2 env $Pm2Id 2>/dev/null || true
"@

$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($bash))
$raw = ssh $Vps "echo $b64 | base64 -d | bash"

# Split sections
$dotIdx = $raw.IndexOf("---DOTENV---")
$pm2Idx = $raw.IndexOf("---PM2ENV---")

if ($dotIdx -lt 0 -or $pm2Idx -lt 0) {
  throw "Could not parse remote output sections."
}

$dotenvText = $raw.Substring($dotIdx + 12, $pm2Idx - ($dotIdx + 12))
$pm2Text    = $raw.Substring($pm2Idx + 10)

$dotenv = Parse-DotEnvText -Text $dotenvText
$pm2env = Parse-Pm2EnvText -Text $pm2Text

# Keys we care about most
$keys = @(
  "HX2_API_URL","HX2_API_KEY",
  "UPSTASH_REDIS_REST_URL","UPSTASH_REDIS_REST_TOKEN",
  "REDIS_URL","REDIS_HOST","REDIS_PORT","REDIS_PASSWORD",
  "BRAIN_URL","BRAIN_SHELL_URL",
  "AP2_SIGNING_SECRET","AP2_VERCEL_HOOK_URL"
)

Write-Host "`n== Drift Report (.env vs pm2 env) ==" -ForegroundColor Cyan

$rows = foreach ($k in $keys) {
  $a = if ($dotenv.ContainsKey($k)) { $dotenv[$k] } else { $null }
  $b = if ($pm2env.ContainsKey($k)) { $pm2env[$k] } else { $null }

  $same = ($a -eq $b)
  [pscustomobject]@{
    Key = $k
    DotEnv = if ($a) { $a } else { "(missing)" }
    Pm2Env = if ($b) { $b } else { "(missing)" }
    Match = if ($same) { "YES" } else { "NO" }
  }
}

$rows | Format-Table -AutoSize

# High-signal warnings
$bad = $rows | Where-Object { $_.Match -eq "NO" -and $_.Key -in @("REDIS_URL","BRAIN_URL","BRAIN_SHELL_URL","HX2_API_KEY","HX2_API_URL") }
if ($bad) {
  Write-Host "`n!! HIGH-SIGNAL DRIFT FOUND (these commonly break the pipeline) !!" -ForegroundColor Yellow
  $bad | Format-Table -AutoSize
} else {
  Write-Host "`nNo high-signal drift detected for core keys." -ForegroundColor Green
}
