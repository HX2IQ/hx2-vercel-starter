Write-Host ""
Write-Host "== HX2 RECOMMENDED DEV FLOW ==" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Rapid iteration:" -ForegroundColor Yellow
Write-Host "   npm run hx2:quick"

Write-Host ""
Write-Host "2. Before commit:" -ForegroundColor Yellow
Write-Host "   npm run hx2:guard"

Write-Host ""
Write-Host "3. Before deploy:" -ForegroundColor Yellow
Write-Host "   npm run build"
Write-Host "   npm run hx2:guard"
Write-Host "   npm run hx2:ship"

Write-Host ""
Write-Host "4. Orchestrator-only validation:" -ForegroundColor Yellow
Write-Host "   npm run hx2:orchestrator:guard"

Write-Host ""
Write-Host "5. Orchestrator readiness report:" -ForegroundColor Yellow
Write-Host "   npm run hx2:orchestrator:report"

Write-Host ""
Write-Host "HX2 DEV FLOW READY" -ForegroundColor Green
