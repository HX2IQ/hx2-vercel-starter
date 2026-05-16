$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 CHAT MASTER READINESS REPORT ==" -ForegroundColor Cyan
Write-Host ""

$api = ".\app\api\hx2\chat-master-status\route.ts"
$map = ".\app\api\hx2\contracts\chat-master-execution-map.ts"
$keywords = ".\app\api\hx2\contracts\chat-master-keywords.ts"
$diagnostics = ".\app\api\hx2\chat-master-diagnostics\route.ts"

if (!(Test-Path $api)) {
  throw "Missing chat master status API"
}

if (!(Test-Path $map)) {
  throw "Missing chat master execution map"
}

if (!(Test-Path $keywords)) {
  throw "Missing chat master keywords contract"
}

if (!(Test-Path $diagnostics)) {
  throw "Missing chat master diagnostics API"
}

$text = (Get-Content $api -Raw) + "`n" + (Get-Content $map -Raw) + "`n" + (Get-Content $keywords -Raw) + "`n" + (Get-Content $diagnostics -Raw)

$fields = @(
  "readiness_percent",
  "healthy_checks",
  "total_checks",
  "chat_master_route",
  "router_route",
  "execute_route",
  "owner_console",
  "CHAT_MASTER_EXECUTION_MAP",
  "CHAT_MASTER_KEYWORDS",
  "diagnostics",
  "keyword_count",
  "execution_target"
)

$missing = @()

foreach ($field in $fields) {
  if ($text -match [regex]::Escape($field)) {
    Write-Host "PASS  $field" -ForegroundColor Green
  } else {
    Write-Host "FAIL  $field" -ForegroundColor Red
    $missing += $field
  }
}

Write-Host ""

$keywordText = Get-Content $keywords -Raw
$keywordGroups = ([regex]::Matches($keywordText, "^\s+[a-z]+:", "Multiline")).Count

Write-Host "Keyword Groups: $keywordGroups" -ForegroundColor Cyan

$mapText = Get-Content $map -Raw
$routeCoverage = ([regex]::Matches($mapText, "^\s+[a-z]+:", "Multiline")).Count

Write-Host "Route Coverage: $routeCoverage" -ForegroundColor Cyan

$diagnosticsText = Get-Content $diagnostics -Raw
$diagnosticsCoverage = ([regex]::Matches($diagnosticsText, "keyword_count|execution_target|intent_count")).Count

Write-Host "Diagnostics Coverage: $diagnosticsCoverage" -ForegroundColor Cyan
Write-Host ""

if ($missing.Count -eq 0) {
  Write-Host "CHAT MASTER READINESS: READY" -ForegroundColor Green
} else {
  Write-Host "CHAT MASTER READINESS: INCOMPLETE" -ForegroundColor Yellow
}

Write-Host ""



