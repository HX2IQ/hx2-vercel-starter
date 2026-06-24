param(
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

$AllowlistPath = ".\tools\hx2-direct-chat-endpoint-allowlist.json"

Write-Host ""
Write-Host "== HX2 DIRECT CHAT ENDPOINT ALLOWLIST GUARD ==" -ForegroundColor Cyan
Write-Host ("Strict: {0}" -f [bool]$Strict)

if (-not (Test-Path -LiteralPath $AllowlistPath)) {
  throw "Missing allowlist file: $AllowlistPath"
}

$Allowlist = ((Get-Content -LiteralPath $AllowlistPath) -join "`n") | ConvertFrom-Json

function Get-Hx2Text {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return ""
  }

  return (Get-Content -LiteralPath $Path) -join "`n"
}

function Test-Hx2ExcludedPath {
  param([string]$Path)

  $Normalized = $Path.Replace("/", "\")

  $ExcludedFragments = @(
    "\.git\",
    "\.next\",
    "\node_modules\",
    "\.vercel\",
    "\coverage\",
    "\dist\",
    "\build\"
  )

  foreach ($Fragment in $ExcludedFragments) {
    if ($Normalized -like "*$Fragment*") {
      return $true
    }
  }

  return $false
}

function Get-Hx2SourceFiles {
  $Roots = @(".\app", ".\components", ".\src", ".\lib")
  $Files = @()

  foreach ($Dir in $Roots) {
    if (Test-Path -LiteralPath $Dir) {
      $Files += Get-ChildItem -LiteralPath $Dir -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object {
          $_.Extension -in @(".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs") -and
          -not (Test-Hx2ExcludedPath -Path $_.FullName)
        }
    }
  }

  return $Files | Sort-Object FullName -Unique
}

function Get-Hx2RelativePath {
  param([string]$Path)

  $Resolved = (Resolve-Path -LiteralPath $Path).Path
  return $Resolved.Replace($Root + "\", "")
}

function Get-Hx2SurfaceClass {
  param([string]$RelativePath)

  $Path = $RelativePath.Replace("/", "\").ToLowerInvariant()

  if ($Path -like "*_quarantine*" -or $Path -like "*quarantine*") {
    return "legacy_quarantine"
  }

  if ($Path -like "app\api\*") {
    return "api_server_route"
  }

  if ($Path -like "app\owner-console\*" -or $Path -eq "app\owner-console\page.tsx") {
    return "owner_admin_diagnostic"
  }

  if ($Path -eq "app\chat\chatclient.tsx") {
    return "active_user_facing_surface"
  }

  if ($Path -like "app\components\*") {
    return "active_user_facing_surface"
  }

  if ($Path -like "app\console\*" -or $Path -like "app\hx2\*" -or $Path -like "app\oi\*") {
    return "active_user_facing_surface"
  }

  if ($Path -like "lib\*" -or $Path -like "src\*") {
    return "library_or_support"
  }

  return "unknown_surface"
}

function Get-Hx2UsageKind {
  param([string]$LineText)

  $Lower = $LineText.ToLowerInvariant()

  if ($Lower.Contains("fetch(")) {
    return "direct_fetch"
  }

  if ($Lower.Contains("href=") -or $Lower.Contains("linkbutton") -or $Lower.Contains("<a ")) {
    return "link_reference"
  }

  if ($Lower.Contains("restore ") -or $Lower.Contains("remediation") -or $Lower.Contains("missing")) {
    return "status_or_remediation_text"
  }

  return "text_reference"
}

function Get-Hx2Endpoint {
  param([string]$LineText)

  if ($LineText.Contains("/api/hx2/chat-master")) {
    return "/api/hx2/chat-master"
  }

  if ($LineText.Contains("/api/hx2/chat")) {
    return "/api/hx2/chat"
  }

  return ""
}

function Test-Hx2AllowedReference {
  param(
    [string]$Path,
    [string]$Endpoint,
    [string]$UsageKind,
    [string]$SurfaceClass
  )

  foreach ($Rule in $Allowlist) {
    $RulePath = [string]$Rule.path
    $AllowedEndpoints = @($Rule.allowedEndpoints)
    $AllowedUsageKinds = @($Rule.allowedUsageKinds)
    $AllowedSurfaceClass = [string]$Rule.allowedSurfaceClass

    if (
      $Path -eq $RulePath -and
      $AllowedEndpoints -contains $Endpoint -and
      $AllowedUsageKinds -contains $UsageKind -and
      $AllowedSurfaceClass -eq $SurfaceClass
    ) {
      return [pscustomobject]@{
        Allowed = $true
        Reason = [string]$Rule.reason
      }
    }
  }

  return [pscustomobject]@{
    Allowed = $false
    Reason = "not in allowlist"
  }
}

Write-Host ""
Write-Host "SCANNING DIRECT CHAT ENDPOINT REFERENCES" -ForegroundColor Cyan

$Rows = @()
$Files = Get-Hx2SourceFiles

foreach ($File in $Files) {
  $RelativePath = Get-Hx2RelativePath -Path $File.FullName
  $Text = Get-Hx2Text -Path $File.FullName

  if ([string]::IsNullOrWhiteSpace($Text)) {
    continue
  }

  if ($Text -notmatch [regex]::Escape("/api/hx2/chat")) {
    continue
  }

  $SurfaceClass = Get-Hx2SurfaceClass -RelativePath $RelativePath
  $AdapterStatus = "no_adapter_marker"

  if ($Text -match "sendHx2MainChatUiMessage" -or $Text -match "sendHx2RetailChatMessage" -or $Text -match "retail_chat_contract_v1") {
    $AdapterStatus = "uses_retail_adapter"
  }

  $Lines = Get-Content -LiteralPath $File.FullName

  for ($i = 0; $i -lt $Lines.Count; $i++) {
    $LineText = [string]$Lines[$i]

    if (-not $LineText.Contains("/api/hx2/chat")) {
      continue
    }

    $Endpoint = Get-Hx2Endpoint -LineText $LineText
    $UsageKind = Get-Hx2UsageKind -LineText $LineText
    $Allowed = Test-Hx2AllowedReference -Path $RelativePath -Endpoint $Endpoint -UsageKind $UsageKind -SurfaceClass $SurfaceClass

    $Severity = "GREEN"

    if (-not $Allowed.Allowed) {
      $Severity = "RED"
    }

    if ($UsageKind -eq "direct_fetch" -and $SurfaceClass -eq "active_user_facing_surface" -and $AdapterStatus -eq "no_adapter_marker") {
      $Severity = "RED"
    }

    $Detail = $LineText.Trim()
    if ($Detail.Length -gt 120) {
      $Detail = $Detail.Substring(0, 120) + "..."
    }

    $Rows += [pscustomobject]@{
      Path = $RelativePath
      Line = $i + 1
      Endpoint = $Endpoint
      UsageKind = $UsageKind
      SurfaceClass = $SurfaceClass
      AdapterStatus = $AdapterStatus
      Allowed = $Allowed.Allowed
      Severity = $Severity
      Reason = $Allowed.Reason
      Detail = $Detail
    }
  }
}

Write-Host ""
Write-Host "ALLOWLIST GUARD MAP" -ForegroundColor Cyan

if ($Rows.Count -gt 0) {
  $Rows |
    Sort-Object Severity, SurfaceClass, Path, Line |
    Format-Table Path, Line, Endpoint, UsageKind, SurfaceClass, Allowed, Severity -AutoSize
} else {
  Write-Host "GREEN: no direct chat endpoint references found." -ForegroundColor Green
}

Write-Host ""
Write-Host "UNALLOWED REFERENCES" -ForegroundColor Cyan

$Unallowed = @($Rows | Where-Object { $_.Allowed -ne $true })
if ($Unallowed.Count -gt 0) {
  $Unallowed | Format-List
} else {
  Write-Host "GREEN: all direct chat endpoint references are explicitly allowlisted." -ForegroundColor Green
}

Write-Host ""
Write-Host "ACTIVE USER-FACING DIRECT FETCH CHECK" -ForegroundColor Cyan

$ActiveDirect = @(
  $Rows | Where-Object {
    $_.UsageKind -eq "direct_fetch" -and
    $_.SurfaceClass -eq "active_user_facing_surface" -and
    $_.AdapterStatus -eq "no_adapter_marker"
  }
)

if ($ActiveDirect.Count -gt 0) {
  $ActiveDirect | Format-List
} else {
  Write-Host "GREEN: no active user-facing unadapted direct chat fetches found." -ForegroundColor Green
}

Write-Host ""
Write-Host "ALLOWLIST SUMMARY" -ForegroundColor Cyan

$Total = @($Rows).Count
$Green = @($Rows | Where-Object Severity -eq "GREEN").Count
$Red = @($Rows | Where-Object Severity -eq "RED").Count

[pscustomobject]@{
  TotalEndpointReferences = $Total
  Green = $Green
  Red = $Red
  UnallowedReferences = @($Unallowed).Count
  ActiveUserFacingDirectFetches = @($ActiveDirect).Count
  Meaning = "This guard fails if a new unallowlisted direct chat endpoint reference appears or if an active user-facing direct fetch bypasses the adapter."
  Next = "Keep this guard in the standard Phase 13 retail chat verification bundle."
} | Format-List

if ($Red -gt 0) {
  throw "Direct chat endpoint allowlist guard found RED references."
}

if ($Strict -and $Total -eq 0) {
  throw "Strict allowlist guard expected known endpoint references but found none."
}

Write-Host ""
Write-Host "LOCAL GIT STATUS" -ForegroundColor Cyan
$Status = git status --short
if ($Status) {
  $Status
  Write-Host "YELLOW: working tree has changes." -ForegroundColor Yellow
} else {
  Write-Host "GREEN: working tree clean" -ForegroundColor Green
}

Write-Host ""
Write-Host "GREEN: direct chat endpoint allowlist guard complete" -ForegroundColor Green
