Write-Host "`n== HX2 FAST KGX VERIFY =="

npx prisma generate

if ($LASTEXITCODE -ne 0) {
  throw "prisma generate failed"
}

npx tsc --noEmit --pretty false

if ($LASTEXITCODE -ne 0) {
  throw "typescript failed"
}

npm run build

if ($LASTEXITCODE -ne 0) {
  throw "build failed"
}

Write-Host "`nFAST KGX VERIFY PASSED" -ForegroundColor Green
