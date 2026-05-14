param(
  [Parameter(Mandatory = $true)]
  [string]$NodeId
)

$ErrorActionPreference = "Stop"

$NodeId = $NodeId.Trim().ToLowerInvariant()

if ($NodeId -in @("ah3","ph1","qa1")) {
  throw "Refusing to remove protected node: $NodeId"
}

$RegistryFile = "app\api\hx2\registry\nodes.json"
$HelperFile   = "app\api\hx2\_lib\$NodeId.ts"
$RouteDir     = "app\api\hx2\nodes\$NodeId"

if (!(Test-Path $RegistryFile)) {
  throw "Registry file not found: $RegistryFile"
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupRoot = "tools\_node_remove_backups\$NodeId`_$stamp"
New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null
Copy-Item $RegistryFile (Join-Path $BackupRoot "nodes.json") -Force
Write-Host "OK: registry backup created"

if (Test-Path $HelperFile) {
  Copy-Item $HelperFile (Join-Path $BackupRoot "$NodeId.ts") -Force
  Remove-Item $HelperFile -Force
  Write-Host "OK: removed helper $HelperFile"
} else {
  Write-Host "WARN: helper not found: $HelperFile"
}

if (Test-Path $RouteDir) {
  Copy-Item $RouteDir (Join-Path $BackupRoot $NodeId) -Recurse -Force
  Remove-Item $RouteDir -Recurse -Force
  Write-Host "OK: removed route dir $RouteDir"
} else {
  Write-Host "WARN: route dir not found: $RouteDir"
}

$data = Get-Content $RegistryFile -Raw | ConvertFrom-Json -Depth 100

if ($data -is [System.Array]) {
  $nodes = @($data)
}
elseif ($null -ne $data.PSObject.Properties["nodes"]) {
  $nodes = @($data.nodes)
}
elseif ($null -ne $data.PSObject.Properties["node_id"]) {
  $nodes = @($data)
}
else {
  throw "Unsupported registry format"
}

$before = @($nodes).Count
$nodes = @($nodes | Where-Object { $_.node_id -ne $NodeId })
$after = @($nodes).Count

if ($before -eq $after) {
  Write-Host "WARN: node was not present in registry: $NodeId"
} else {
  Write-Host "OK: removed $NodeId from registry"
}

$nodes | ConvertTo-Json -Depth 100 -AsArray | Set-Content -Path $RegistryFile -Encoding UTF8

Write-Host ""
Write-Host "Next:"
Write-Host "npm run build"
Write-Host ".\tools\dev2-node-registry-dashboard.ps1"

