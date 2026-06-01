$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 CHAT BOOTSTRAP =="

$Files = @(
  "HX2_CHAT_BOOTSTRAP.md",
  "HX2_BOOTSTRAP_STATE.md",
  "DEV2_DEPLOYMENT_TRUTH.md",
  "DEV2_DEPLOYMENT_CHECKLIST.md"
)

foreach ($File in $Files) {

  if (Test-Path $File) {

    Write-Host ""
    Write-Host "==============================="
    Write-Host $File
    Write-Host "==============================="

    Get-Content $File
  }
  else {

    Write-Host ""
    Write-Host "Missing:"
    Write-Host $File
  }
}
