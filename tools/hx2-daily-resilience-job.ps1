param(
  [string]$RepoPath = "C:\Users\ezdet\hx2-vercel-starter"
)

$ErrorActionPreference = "Stop"

Set-Location $RepoPath

Write-Host "`n== HX2 DAILY RESILIENCE JOB =="
Write-Host "Repo: $RepoPath"
Write-Host "Secrets printed: false"

Write-Host "`n== STEP 1: DATABASE BACKUP =="
npm run hx2:db:backup -- -Label scheduled
if ($LASTEXITCODE -ne 0) { throw "Scheduled database backup failed." }

Write-Host "`n== STEP 2: BACKUP HEALTH =="
npm run hx2:db:health
if ($LASTEXITCODE -ne 0) { throw "Backup health failed." }

Write-Host "`n== STEP 3: BACKUP MIRROR =="
npm run hx2:backup:mirror
if ($LASTEXITCODE -ne 0) { throw "Backup mirror failed." }

Write-Host "`n== STEP 4: RESTORE-READINESS =="
npm run hx2:db:restore-test
if ($LASTEXITCODE -ne 0) { throw "Restore-readiness failed." }

Write-Host "`nGREEN: HX2 daily resilience job complete."
