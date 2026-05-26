$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 SAFE DEPLOY WITH ROLLBACK GUARD ==" -ForegroundColor Cyan

try {
  .\tools\deploy-hx2-safe.ps1
  Write-Host ""
  Write-Host "SAFE DEPLOY PASSED. No rollback needed." -ForegroundColor Green
}
catch {
  Write-Host ""
  Write-Host "SAFE DEPLOY FAILED." -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red

  Write-Host ""
  Write-Host "Recent Vercel deployments:" -ForegroundColor Yellow
  vercel ls --prod

  Write-Host ""
  Write-Host "Rollback instruction:" -ForegroundColor Yellow
  Write-Host "1. Find the previous known-good deployment URL/hash above."
  Write-Host "2. Run:"
  Write-Host "   vercel rollback <deployment-url-or-id>"
  Write-Host ""
  throw "Deploy failed. Review recent deployments and rollback if needed."
}
