$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 syntax/type guard ==" -ForegroundColor Cyan

$LocalTsc = Join-Path (Get-Location) "node_modules\.bin\tsc.cmd"

if (Test-Path $LocalTsc) {
  Write-Host "Using local TypeScript compiler: node_modules\.bin\tsc.cmd" -ForegroundColor DarkGray
  & $LocalTsc --noEmit --pretty false
} else {
  Write-Host "Local TypeScript compiler not found; falling back to npx tsc." -ForegroundColor Yellow
  npx tsc --noEmit --pretty false
}

if ($LASTEXITCODE -ne 0) {
  throw "TypeScript syntax/type guard failed."
}

Write-Host "PASS: HX2 syntax/type guard passed." -ForegroundColor Green
