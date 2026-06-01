param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 DEPLOYMENT TOPOLOGY FINGERPRINT =="

$Fingerprint = [ordered]@{
  timestamp = (Get-Date).ToString("o")
  git_branch = (git branch --show-current)
  git_sha = (git rev-parse HEAD)
  vercel_project = ""
  vercel_root_directory = ""
  routes_detected = @()
}

if (Test-Path ".vercel/project.json") {

  $Project = Get-Content ".vercel/project.json" -Raw | ConvertFrom-Json

  $Fingerprint.vercel_project = $Project.projectName
  $Fingerprint.vercel_root_directory = $Project.settings.rootDirectory
}

$Routes = Get-ChildItem ".\app\api\hx2" -Directory |
  Select-Object -ExpandProperty Name |
  Sort-Object

$Fingerprint.routes_detected = $Routes

$OutDir = ".\tools\_topology"

if (!(Test-Path $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir | Out-Null
}

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"

$OutFile = "$OutDir\topology-fingerprint-$Stamp.json"

$Fingerprint |
  ConvertTo-Json -Depth 20 |
  Set-Content $OutFile -Encoding UTF8

Write-Host ""
Write-Host "Fingerprint written:"
Write-Host $OutFile
