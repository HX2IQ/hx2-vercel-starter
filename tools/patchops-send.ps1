param(
  [Parameter(Mandatory=$true)][string]$Base,
  [Parameter(Mandatory=$true)][string]$PatchOpsKey,
  [Parameter(Mandatory=$true)][string]$Message,
  [Parameter(Mandatory=$true)][string]$FileRel,
  [Parameter(Mandatory=$true)][string]$ContentPath,
  [string]$Branch = "main"
)

if (!(Test-Path -LiteralPath $ContentPath)) { throw "Missing ContentPath: $ContentPath" }

# Read file content exactly
$content = Get-Content -LiteralPath $ContentPath -Raw

$body = @{
  branch  = $Branch
  message = $Message
  files   = @(
    @{
      path    = $FileRel
      content = $content
    }
  )
} | ConvertTo-Json -Depth 8

$r = Invoke-RestMethod "$Base/api/patchops/commit" -Method Post -ContentType "application/json" `
  -Headers @{ "x-patchops-key" = $PatchOpsKey } `
  -Body $body

$r | ConvertTo-Json -Depth 8