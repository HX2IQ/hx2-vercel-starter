param(
  [Parameter(Mandatory = $true)]
  [string]$NodeId,

  [Parameter(Mandatory = $false)]
  [object]$Enabled,

  [Parameter(Mandatory = $false)]
  [object]$DryRunOnly,

  [Parameter(Mandatory = $false)]
  [string]$Status
)

$ErrorActionPreference = "Stop"

function Convert-ToBoolOrNull {
  param([object]$Value)

  if ($null -eq $Value) { return $null }
  if ($Value -is [bool]) { return $Value }

  $text = "$Value".Trim().ToLowerInvariant()
  switch ($text) {
    "true"  { return $true }
    "false" { return $false }
    "1"     { return $true }
    "0"     { return $false }
    default { throw "Cannot convert value to boolean: $Value" }
  }
}

function Ensure-Property {
  param(
    [Parameter(Mandatory = $true)] $Object,
    [Parameter(Mandatory = $true)] [string]$Name,
    [Parameter(Mandatory = $false)] $Value = $null
  )

  if ($null -eq $Object.PSObject.Properties[$Name]) {
    $Object | Add-Member -NotePropertyName $Name -NotePropertyValue $Value
  } else {
    $Object.$Name = $Value
  }
}

$RegistryFile = "app\api\hx2\registry\nodes.json"

if (!(Test-Path $RegistryFile)) {
  throw "Registry file not found: $RegistryFile"
}

$BackupFile = "$RegistryFile.bak_{0}" -f (Get-Date -Format "yyyyMMdd_HHmmss")
Copy-Item $RegistryFile $BackupFile -Force
Write-Host "OK: backup created: $BackupFile"

$jsonText = Get-Content $RegistryFile -Raw
if ([string]::IsNullOrWhiteSpace($jsonText)) {
  throw "Registry file is empty: $RegistryFile"
}

$data = $jsonText | ConvertFrom-Json -Depth 100

# Normalize all supported shapes into an array, but ALWAYS write back as an array.
$nodes = $null

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
  throw "Unsupported registry format. Expected array, single node object, or object with .nodes"
}

$target = $nodes | Where-Object { $_.node_id -eq $NodeId } | Select-Object -First 1

if ($null -eq $target) {
  throw "Node not found in registry: $NodeId"
}

if ($null -eq $target.PSObject.Properties["activation"]) {
  $target | Add-Member -NotePropertyName activation -NotePropertyValue ([pscustomobject]@{})
}

if ($null -eq $target.activation) {
  $target.activation = [pscustomobject]@{}
}

if ($PSBoundParameters.ContainsKey("Enabled")) {
  $enabledBool = Convert-ToBoolOrNull $Enabled
  Ensure-Property -Object $target.activation -Name "enabled" -Value $enabledBool
  Write-Host "OK: set enabled=$enabledBool for $NodeId"
}

if ($PSBoundParameters.ContainsKey("DryRunOnly")) {
  $dryRunBool = Convert-ToBoolOrNull $DryRunOnly
  Ensure-Property -Object $target.activation -Name "dry_run_only" -Value $dryRunBool
  Write-Host "OK: set dry_run_only=$dryRunBool for $NodeId"
}

if ($PSBoundParameters.ContainsKey("Status") -and -not [string]::IsNullOrWhiteSpace($Status)) {
  Ensure-Property -Object $target -Name "status" -Value $Status
  Write-Host "OK: set status=$Status for $NodeId"
}

# CRITICAL HARDENING: ALWAYS serialize as a JSON array.
$outJson = @($nodes) | ConvertTo-Json -Depth 100 -AsArray

Set-Content -Path $RegistryFile -Value $outJson -Encoding UTF8

Write-Host ""
Write-Host "Updated node:"
$target | ConvertTo-Json -Depth 20

Write-Host ""
Write-Host "Registry written in stable array shape."

