$ErrorActionPreference = "Stop"

$File = "app/api/chat/send/route.ts"
if (!(Test-Path $File)) { throw "Missing: $File" }

$src = Get-Content $File -Raw

# Idempotent: if already patched, exit
if ($src -match "HX2_WEB_ENABLED" -or $src -match "const\s+wantWeb\s*=") {
  Write-Host "Already patched: $File"
  exit 0
}

# Anchor on YOUR existing body parse line
$needleRx = 'const\s+body\s*=\s*await\s+req\.json\(\)\.catch\([\s\S]*?\);\s*'
if ($src -notmatch $needleRx) {
  throw "Anchor not found: expected 'const body = await req.json().catch(...)' in $File"
}

$insert = @"
const wantWeb =
  process.env.HX2_WEB_ENABLED === "true" &&
  /today|latest|current|now|who won|score|price|news/i.test(String(body?.message || body?.text || body?.input || ""));

"@

# Insert directly after that const body = ... line
$src = [regex]::Replace($src, $needleRx, ('$0' + "`n" + $insert), 1)

Set-Content -Encoding UTF8 -NoNewline -Path $File -Value $src
Write-Host "Patched web-fetch gate into $File"