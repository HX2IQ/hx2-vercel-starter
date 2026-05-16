$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CHAT MASTER KEYWORDS GUARD ==" -ForegroundColor Cyan

$file = ".\app\api\hx2\contracts\chat-master-keywords.ts"

if (!(Test-Path $file)) {
  throw "Missing chat master keywords contract"
}

$text = Get-Content $file -Raw

$required = @(
  "CHAT_MASTER_KEYWORDS",
  "health",
  "markets",
  "legal",
  "parenting",
  "developer",
  "supplement",
  "xrp",
  "trademark",
  "reading",
  "typescript"
)

$missing = @()

foreach ($item in $required) {
  if ($text -notmatch [regex]::Escape($item)) {
    $missing += $item
  }
}

if ($missing.Count -gt 0) {
  Write-Host "CHAT MASTER KEYWORDS GUARD FAILED" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "- Missing: $_" -ForegroundColor Yellow }
  throw "Chat master keywords contract incomplete"
}

Write-Host "CHAT MASTER KEYWORDS GUARD PASSED" -ForegroundColor Green
