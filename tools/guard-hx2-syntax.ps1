$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 syntax/type guard ==" -ForegroundColor Cyan

npx tsc --noEmit --pretty false

if ($LASTEXITCODE -ne 0) {
  throw "TypeScript syntax/type guard failed."
}

Write-Host "PASS: HX2 syntax/type guard passed." -ForegroundColor Green
