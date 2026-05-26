param(
  [Parameter(Mandatory = $true)]
  [string]$NodeId,

  [Parameter(Mandatory = $false)]
  [object]$Enabled,

  [Parameter(Mandatory = $false)]
  [object]$DryRunOnly,

  [Parameter(Mandatory = $false)]
  [string]$Status,

  [Parameter(Mandatory = $false)]
  [string]$Base = "https://optinodeiq.com",

  [Parameter(Mandatory = $false)]
  [string]$UserQuery = "Analyze my stack."
)

$ErrorActionPreference = "Stop"

function Step($Text) {
  Write-Host ""
  Write-Host "== $Text ==" -ForegroundColor Cyan
}

function Ensure-ScriptExists($Path) {
  if (!(Test-Path $Path)) {
    throw "Required script not found: $Path"
  }
}

$ToggleScript = ".\tools\dev2-node-activation-toggle.ps1"
Ensure-ScriptExists $ToggleScript

Step "toggle node state"

$toggleParams = @{
  NodeId = $NodeId
}

if ($PSBoundParameters.ContainsKey("Enabled")) {
  $toggleParams.Enabled = $Enabled
}

if ($PSBoundParameters.ContainsKey("DryRunOnly")) {
  $toggleParams.DryRunOnly = $DryRunOnly
}

if ($PSBoundParameters.ContainsKey("Status") -and -not [string]::IsNullOrWhiteSpace($Status)) {
  $toggleParams.Status = $Status
}

& $ToggleScript @toggleParams

Step "show registry file"
Get-Content "app\api\hx2\registry\nodes.json"

Step "build"
npm run build
if ($LASTEXITCODE -ne 0) {
  throw "Build failed"
}

Step "deploy"
$deployOk = $false
for ($i = 1; $i -le 3; $i++) {
  Write-Host "Deploy attempt $i..."
  vercel --prod
  if ($LASTEXITCODE -eq 0) {
    $deployOk = $true
    break
  }
  Start-Sleep -Seconds 5
}
if (-not $deployOk) {
  throw "Vercel deploy failed after 3 attempts"
}

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

Step "smoke test registry preview"
Invoke-RestMethod "$Base/api/hx2/registry/preview?ts=$ts" | ConvertTo-Json -Depth 10

Step "smoke test registry detail"
Invoke-RestMethod "$Base/api/hx2/registry/detail?node_id=$NodeId&ts=$ts" | ConvertTo-Json -Depth 10

Step "smoke test execute"
$Body = @{
  node_id    = $NodeId
  user_query = $UserQuery
} | ConvertTo-Json -Depth 10

try {
  Invoke-RestMethod `
    -Uri "$Base/api/hx2/execute?ts=$ts" `
    -Method POST `
    -ContentType "application/json" `
    -Body $Body | ConvertTo-Json -Depth 10
}
catch {
  $raw = param(
  [Parameter(Mandatory = $true)]
  [string]$NodeId,

  [Parameter(Mandatory = $false)]
  [object]$Enabled,

  [Parameter(Mandatory = $false)]
  [object]$DryRunOnly,

  [Parameter(Mandatory = $false)]
  [string]$Status,

  [Parameter(Mandatory = $false)]
  [string]$Base = "https://optinodeiq.com",

  [Parameter(Mandatory = $false)]
  [string]$UserQuery = "Analyze my stack."
)

$ErrorActionPreference = "Stop"

function Step($Text) {
  Write-Host ""
  Write-Host "== $Text ==" -ForegroundColor Cyan
}

function Ensure-ScriptExists($Path) {
  if (!(Test-Path $Path)) {
    throw "Required script not found: $Path"
  }
}

$ToggleScript = ".\tools\dev2-node-activation-toggle.ps1"
Ensure-ScriptExists $ToggleScript

Step "toggle node state"

$toggleParams = @{
  NodeId = $NodeId
}

if ($PSBoundParameters.ContainsKey("Enabled")) {
  $toggleParams.Enabled = $Enabled
}

if ($PSBoundParameters.ContainsKey("DryRunOnly")) {
  $toggleParams.DryRunOnly = $DryRunOnly
}

if ($PSBoundParameters.ContainsKey("Status") -and -not [string]::IsNullOrWhiteSpace($Status)) {
  $toggleParams.Status = $Status
}

& $ToggleScript @toggleParams

Step "show registry file"
Get-Content "app\api\hx2\registry\nodes.json"

Step "build"
npm run build
if ($LASTEXITCODE -ne 0) {
  throw "Build failed"
}

Step "deploy"
$deployOk = $false
for ($i = 1; $i -le 3; $i++) {
  Write-Host "Deploy attempt $i..."
  vercel --prod
  if ($LASTEXITCODE -eq 0) {
    $deployOk = $true
    break
  }
  Start-Sleep -Seconds 5
}
if (-not $deployOk) {
  throw "Vercel deploy failed after 3 attempts"
}

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

Step "smoke test registry preview"
Invoke-RestMethod "$Base/api/hx2/registry/preview?ts=$ts" | ConvertTo-Json -Depth 10

Step "smoke test registry detail"
Invoke-RestMethod "$Base/api/hx2/registry/detail?node_id=$NodeId&ts=$ts" | ConvertTo-Json -Depth 10

Step "smoke test execute"
$Body = @{
  node_id    = $NodeId
  user_query = $UserQuery
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Uri "$Base/api/hx2/execute?ts=$ts" `
  -Method POST `
  -ContentType "application/json" `
  -Body $Body | ConvertTo-Json -Depth 10

Step "done"
Write-Host "Node lifecycle workflow completed for $NodeId" -ForegroundColor Green
.ErrorDetails.Message
  if ($raw) {
    Write-Host $raw
    if ($raw -match "Node disabled") {
      Write-Host "OK: disabled-node response received as expected." -ForegroundColor Yellow
    } else {
      throw
    }
  } else {
    throw
  }
}

Step "done"
Write-Host "Node lifecycle workflow completed for $NodeId" -ForegroundColor Green

