$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 TOPOLOGY GUARD =="

$Root = [System.IO.Path]::GetFullPath((git rev-parse --show-toplevel).Trim()).TrimEnd("\")
$Here = [System.IO.Path]::GetFullPath((Get-Location).Path).TrimEnd("\")

if ($Here.ToLowerInvariant() -ne $Root.ToLowerInvariant()) {
  throw "Run from repo root. Current directory does not match git root."
}

$Branch = (git branch --show-current).Trim()

if ($Branch -ne "main") {
  throw "Expected branch main. Got: $Branch"
}

if (!(Test-Path "package.json")) {
  throw "Missing package.json at repo root"
}

if (!(Test-Path "app/api")) {
  throw "Missing canonical app/api route tree"
}

if (Test-Path "src/app/api") {
  $SrcRoutes = Get-ChildItem "src/app/api" -Recurse -File -Filter "route.ts" -ErrorAction SilentlyContinue

  if ($SrcRoutes.Count -gt 0) {
    throw "Duplicate API topology detected: src/app/api contains route.ts files while app/api is active."
  }
}

if (!(Test-Path "vercel.json")) {
  throw "Missing vercel.json"
}

$VercelJsonRaw = Get-Content "vercel.json" -Raw

if ($VercelJsonRaw.Contains("/src/app/api")) {
  throw "Stale Vercel src/app/api override detected"
}

if (!(Test-Path ".vercel/project.json")) {
  throw "Missing .vercel/project.json"
}

$ProjectJson = Get-Content ".vercel/project.json" -Raw | ConvertFrom-Json

if ($ProjectJson.projectName -ne "optinodeiq") {
  throw "Expected Vercel projectName optinodeiq. Got: $($ProjectJson.projectName)"
}

Write-Host "Repo root: $Root"
Write-Host "Branch: $Branch"
Write-Host "Vercel project: $($ProjectJson.projectName)"
Write-Host "Root directory: $($ProjectJson.settings.rootDirectory)"
Write-Host "DEV2 TOPOLOGY GUARD PASSED"

