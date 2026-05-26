Set-Location "C:\Users\ezdet\hx2-vercel-starter"
$ErrorActionPreference = "Stop"

Write-Host "== owner-actions sanity check ==" -ForegroundColor Cyan

$file = ".\app\owner-console\actions\page.tsx"
$content = Get-Content $file -Raw

$checks = @(
  'const isPostflightResult = result?.action === "postflight";',
  'const isDeployResult = result?.action === "deploy";',
  'Run Deploy',
  'Run Postflight',
  'Recent Action History',
  'O2 Recommended Safe Actions'
)

$failed = $false
foreach ($c in $checks) {
  if ($content -notmatch [regex]::Escape($c)) {
    Write-Host "MISSING: $c" -ForegroundColor Red
    $failed = $true
  } else {
    Write-Host "OK: $c" -ForegroundColor Green
  }
}

if ($failed) {
  throw "Owner Actions sanity check failed"
}

Write-Host ""
Write-Host "Owner Actions sanity check passed" -ForegroundColor Green
