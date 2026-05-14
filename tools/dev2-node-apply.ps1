param(
  [Parameter(Mandatory = $true)]
  [string]$SpecPath,

  [string]$Base = "https://optinodeiq.com",

  [switch]$SkipBuild,

  [switch]$SkipSmokeTest
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
  Write-Host ""
  Write-Host "== $msg ==" -ForegroundColor Cyan
}

function Backup-IfExists([string]$PathToBackup) {
  if (Test-Path $PathToBackup) {
    $ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    Copy-Item $PathToBackup "$PathToBackup.bak.$ts" -Force
  }
}

function Ensure-DirForFile([string]$FilePath) {
  $dir = Split-Path $FilePath
  if ($dir -and !(Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
}

function Invoke-Hx2JsonPost([string]$Url, $BodyObj) {
  return Invoke-RestMethod $Url `
    -Method POST `
    -ContentType "application/json" `
    -Body ($BodyObj | ConvertTo-Json -Depth 20) `
    -TimeoutSec 120
}

if (!(Test-Path $SpecPath)) {
  throw "Spec file not found: $SpecPath"
}

Write-Step "load spec"
$spec = Get-Content $SpecPath -Raw | ConvertFrom-Json
$nodeId = [string]$spec.node_id
if ([string]::IsNullOrWhiteSpace($nodeId)) {
  throw "Spec must include node_id"
}

Write-Step "validate spec"
$validate = Invoke-Hx2JsonPost "$Base/api/hx2/node/spec/validate" $spec
$validate | ConvertTo-Json -Depth 20

if (-not $validate.valid) {
  throw "Spec validation failed"
}

Write-Step "scaffold preview"
$scaffold = Invoke-Hx2JsonPost "$Base/api/hx2/node/scaffold" $spec
$scaffold | ConvertTo-Json -Depth 20

if (-not $scaffold.valid -or -not $scaffold.scaffold) {
  throw "Scaffold generation failed"
}

Write-Step "dry-run build"
$dryRun = Invoke-Hx2JsonPost "$Base/api/hx2/node/build/dry-run" $spec
$dryRun | ConvertTo-Json -Depth 20

if (-not $dryRun.valid -or -not $dryRun.dry_run) {
  throw "Dry-run build failed"
}

Write-Step "write generated files locally"
foreach ($f in $dryRun.dry_run.files_to_write) {
  $path = ".\" + ([string]$f.path).Replace("/", "\")
  Ensure-DirForFile $path
  Backup-IfExists $path
  Set-Content $path $f.content -Encoding UTF8
  Write-Host "Wrote $path"
}

Write-Step "update local registry"
$registryPreview = Invoke-Hx2JsonPost "$Base/api/hx2/node/registry/preview" $spec
$registryPreview | ConvertTo-Json -Depth 20

if (-not $registryPreview.valid -or -not $registryPreview.registry_preview.entry) {
  throw "Registry preview failed"
}

$registryDir = ".\app\api\hx2\_registry"
$registryFile = ".\app\api\hx2\_registry\nodes.json"

if (!(Test-Path $registryDir)) {
  New-Item -ItemType Directory -Force -Path $registryDir | Out-Null
}

if (Test-Path $registryFile) {
  Backup-IfExists $registryFile
  $registry = Get-Content $registryFile -Raw | ConvertFrom-Json
} else {
  $registry = @{}
}

if (-not $registry) { $registry = @{} }

if ($registry.PSObject.Properties.Name -notcontains $nodeId) {
  $registry | Add-Member -NotePropertyName $nodeId -NotePropertyValue $registryPreview.registry_preview.entry
} else {
  $registry.$nodeId = $registryPreview.registry_preview.entry
}
$registry | ConvertTo-Json -Depth 30 | Set-Content $registryFile -Encoding UTF8
Write-Host "Updated $registryFile"

if (-not $SkipBuild) {
  Write-Step "run guarded build"
  & powershell -ExecutionPolicy Bypass -File .\tools\owner-actions-guard-deploy.ps1
  if ($LASTEXITCODE -ne 0) {
    throw "Build failed; aborting before smoke test"
  }
}

if (-not $SkipSmokeTest) {
  Write-Step "smoke test generated node"
  $smoke = Invoke-Hx2JsonPost "$Base/api/hx2/nodes/$nodeId" @{
    user_query = "smoke test"
  }
  $smoke | ConvertTo-Json -Depth 20
}

Write-Step "done"
Write-Host "Node apply completed for $nodeId" -ForegroundColor Green



