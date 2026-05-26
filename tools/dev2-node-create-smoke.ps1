param(
  [Parameter(Mandatory = $true)]
  [string]$NodeId
)

$ErrorActionPreference = "Stop"

$NodeId = $NodeId.Trim().ToLowerInvariant()

$HelperFile = "app\api\hx2\_lib\$NodeId.ts"
$RouteFile  = "app\api\hx2\nodes\$NodeId\route.ts"
$RegistryFile = "app\api\hx2\registry\nodes.json"

Write-Host "== Dev2 node creation smoke: $NodeId ==" -ForegroundColor Cyan

foreach ($file in @($HelperFile, $RouteFile, $RegistryFile)) {
  if (!(Test-Path $file)) {
    throw "Missing required file: $file"
  }
  Write-Host "OK exists: $file"
}

$badPlaceholders = Select-String -Path $HelperFile,$RouteFile -Pattern "__NODE_ID__|__NODE_LABEL__|__PURPOSE__|__FUNC_PREFIX__|PASTE TEMPLATE"
if ($badPlaceholders) {
  $badPlaceholders | Format-Table Path,LineNumber,Line -AutoSize
  throw "Unreplaced template placeholder detected"
}
Write-Host "OK: no unreplaced placeholders"

$routeImport = Select-String -Path $RouteFile -Pattern "../../_lib/$NodeId"
if (!$routeImport) {
  throw "Route import path missing or wrong for $NodeId"
}
Write-Host "OK: route import path valid"

$data = Get-Content $RegistryFile -Raw | ConvertFrom-Json -Depth 100
$nodes = @()
if ($data -is [System.Array]) {
  $nodes = @($data)
} elseif ($null -ne $data.PSObject.Properties["nodes"]) {
  $nodes = @($data.nodes)
} elseif ($null -ne $data.PSObject.Properties["node_id"]) {
  $nodes = @($data)
} else {
  throw "Unsupported registry format"
}

$node = $nodes | Where-Object { $_.node_id -eq $NodeId } | Select-Object -First 1
if ($null -eq $node) {
  throw "Node missing from registry: $NodeId"
}

if ($node.route_path -ne "/api/hx2/nodes/$NodeId") {
  throw "Registry route_path mismatch. Found: $($node.route_path)"
}

if ($node.activation.enabled -ne $true) {
  throw "Registry enabled is not true"
}

if ($node.activation.dry_run_only -ne $false) {
  throw "Registry dry_run_only is not false"
}

Write-Host "OK: registry entry valid"

Write-Host ""
Write-Host "Running build..."
npm run build
if ($LASTEXITCODE -ne 0) {
  throw "Build failed"
}

Write-Host ""
Write-Host "OK: node creation smoke passed for $NodeId" -ForegroundColor Green
