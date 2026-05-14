param(
  [Parameter(Mandatory = $true)]
  [string]$NodeId,

  [Parameter(Mandatory = $true)]
  [string]$NodeLabel,

  [Parameter(Mandatory = $true)]
  [string]$Purpose,

  [Parameter(Mandatory = $false)]
  [string]$Status = "active_v1"
)

$ErrorActionPreference = "Stop"

function To-PascalCase {
  param([string]$Value)

  (($Value -split "[-_\s]+") | ForEach-Object {
    if ($_.Length -eq 0) { "" }
    else { $_.Substring(0,1).ToUpperInvariant() + $_.Substring(1).ToLowerInvariant() }
  }) -join ""
}

$NodeId = $NodeId.Trim().ToLowerInvariant()
if ($NodeId -notmatch '^[a-z][a-z0-9]*$') {
  throw "NodeId must be lowercase alphanumeric and start with a letter. Example: ph2"
}

$FuncPrefix = To-PascalCase $NodeId

$HelperTemplate = "tools\templates\hx2-node-helper.template.txt"
$RouteTemplate  = "tools\templates\hx2-node-route.template.txt"

if (!(Test-Path $HelperTemplate)) { throw "Missing helper template: $HelperTemplate" }
if (!(Test-Path $RouteTemplate)) { throw "Missing route template: $RouteTemplate" }

$HelperFile = "app\api\hx2\_lib\$NodeId.ts"
$RouteFile  = "app\api\hx2\nodes\$NodeId\route.ts"
$RegistryFile = "app\api\hx2\registry\nodes.json"

if (Test-Path $HelperFile) { throw "Helper already exists: $HelperFile" }
if (Test-Path $RouteFile) { throw "Route already exists: $RouteFile" }
if (!(Test-Path $RegistryFile)) { throw "Registry not found: $RegistryFile" }

New-Item -ItemType Directory -Force -Path (Split-Path $HelperFile) | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path $RouteFile) | Out-Null

$helper = Get-Content $HelperTemplate -Raw
$route  = Get-Content $RouteTemplate -Raw

$helper = $helper.Replace("__NODE_ID__", $NodeId).Replace("__NODE_LABEL__", $NodeLabel).Replace("__PURPOSE__", $Purpose).Replace("__FUNC_PREFIX__", $FuncPrefix)
$route  = $route.Replace("__NODE_ID__", $NodeId).Replace("__NODE_LABEL__", $NodeLabel).Replace("__PURPOSE__", $Purpose).Replace("__FUNC_PREFIX__", $FuncPrefix)

Set-Content -Path $HelperFile -Value $helper -Encoding UTF8
Set-Content -Path $RouteFile -Value $route -Encoding UTF8

Write-Host "OK: wrote $HelperFile"
Write-Host "OK: wrote $RouteFile"

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

$existing = $nodes | Where-Object { $_.node_id -eq $NodeId } | Select-Object -First 1
if ($null -ne $existing) {
  throw "Node already exists in registry: $NodeId"
}

$nodes += [pscustomobject]@{
  node_id    = $NodeId
  node_label = $NodeLabel
  route_path = "/api/hx2/nodes/$NodeId"
  status     = $Status
  activation = [pscustomobject]@{
    enabled      = $true
    dry_run_only = $false
  }
}

$nodes | ConvertTo-Json -Depth 100 -AsArray | Set-Content -Path $RegistryFile -Encoding UTF8

Write-Host "OK: added $NodeId to registry"
Write-Host ""
Write-Host "Next:"
Write-Host ".\tools\dev2-node-create-smoke.ps1 -NodeId $NodeId"
Write-Host ".\tools\dev2-node-lifecycle.ps1 -NodeId $NodeId -DryRunOnly `$false"

$SmokeScript = ".\tools\dev2-node-create-smoke.ps1"
if (!(Test-Path $SmokeScript)) {
  throw "Missing smoke script: $SmokeScript"
}

Write-Host ""
Write-Host "Running post-create smoke validation..."
& $SmokeScript -NodeId $NodeId


