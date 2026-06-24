param(
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

Write-Host ""
Write-Host "== HX2 DIRECT CHAT ENDPOINT CLEANUP REPORT ==" -ForegroundColor Cyan
Write-Host ("Strict: {0}" -f [bool]$Strict)

function Get-Hx2Text {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return ""
  }

  return (Get-Content -LiteralPath $Path) -join "`n"
}

function New-Hx2Row {
  param(
    [string]$Path,
    [int]$Line,
    [string]$Endpoint,
    [string]$UsageKind,
    [string]$SurfaceClass,
    [string]$AdapterStatus,
    [string]$Severity,
    [string]$Detail
  )

  return [pscustomobject]@{
    Path = $Path
    Line = $Line
    Endpoint = $Endpoint
    UsageKind = $UsageKind
    SurfaceClass = $SurfaceClass
    AdapterStatus = $AdapterStatus
    Severity = $Severity
    Detail = $Detail
  }
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

  if ($Lower.Contains("pattern") -or $Lower.Contains("select-string") -or $Lower.Contains("endpoint cleanup")) {
    return "test_or_tooling_reference"
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

function Get-Hx2Severity {
  param(
    [string]$UsageKind,
    [string]$SurfaceClass,
    [string]$AdapterStatus
  )

  if ($UsageKind -eq "direct_fetch" -and $SurfaceClass -eq "active_user_facing_surface" -and $AdapterStatus -eq "no_adapter_marker") {
    return "RED"
  }

  if ($UsageKind -eq "direct_fetch" -and $SurfaceClass -eq "unknown_surface" -and $AdapterStatus -eq "no_adapter_marker") {
    return "YELLOW"
  }

  if ($UsageKind -eq "direct_fetch" -and $SurfaceClass -eq "owner_admin_diagnostic") {
    return "YELLOW"
  }

  if ($UsageKind -eq "direct_fetch" -and $SurfaceClass -eq "legacy_quarantine") {
    return "GREEN"
  }

  if ($UsageKind -eq "direct_fetch" -and $SurfaceClass -eq "api_server_route") {
    return "GREEN"
  }

  if ($UsageKind -eq "direct_fetch" -and $AdapterStatus -eq "uses_retail_adapter") {
    return "GREEN"
  }

  return "GREEN"
}

Write-Host ""
Write-Host "SCANNING SOURCE FILES" -ForegroundColor Cyan

$Files = Get-Hx2SourceFiles
$Rows = @()

foreach ($File in $Files) {
  $RelativePath = Get-Hx2RelativePath -Path $File.FullName
  $Text = Get-Hx2Text -Path $File.FullName

  if ([string]::IsNullOrWhiteSpace($Text)) {
    continue
  }

  if ($Text -notmatch [regex]::Escape("/api/hx2/chat")) {
    continue
  }

  $AdapterStatus = "no_adapter_marker"
  if ($Text -match "sendHx2MainChatUiMessage" -or $Text -match "sendHx2RetailChatMessage" -or $Text -match "retail_chat_contract_v1") {
    $AdapterStatus = "uses_retail_adapter"
  }

  $SurfaceClass = Get-Hx2SurfaceClass -RelativePath $RelativePath
  $Lines = Get-Content -LiteralPath $File.FullName

  for ($i = 0; $i -lt $Lines.Count; $i++) {
    $LineText = [string]$Lines[$i]

    if (-not $LineText.Contains("/api/hx2/chat")) {
      continue
    }

    $Endpoint = Get-Hx2Endpoint -LineText $LineText
    $UsageKind = Get-Hx2UsageKind -LineText $LineText
    $Severity = Get-Hx2Severity -UsageKind $UsageKind -SurfaceClass $SurfaceClass -AdapterStatus $AdapterStatus

    $Detail = $LineText.Trim()
    if ($Detail.Length -gt 140) {
      $Detail = $Detail.Substring(0, 140) + "..."
    }

    $Rows += New-Hx2Row -Path $RelativePath -Line ($i + 1) -Endpoint $Endpoint -UsageKind $UsageKind -SurfaceClass $SurfaceClass -AdapterStatus $AdapterStatus -Severity $Severity -Detail $Detail
  }
}

Write-Host ""
Write-Host "DIRECT CHAT ENDPOINT MAP" -ForegroundColor Cyan

if ($Rows.Count -gt 0) {
  $Rows |
    Sort-Object Severity, SurfaceClass, Path, Line |
    Format-Table Path, Line, Endpoint, UsageKind, SurfaceClass, AdapterStatus, Severity -AutoSize
} else {
  Write-Host "GREEN: no /api/hx2/chat or /api/hx2/chat-master references found in scanned source files." -ForegroundColor Green
}

Write-Host ""
Write-Host "COUNTS BY SURFACE CLASS" -ForegroundColor Cyan

if ($Rows.Count -gt 0) {
  $Rows |
    Group-Object SurfaceClass |
    Sort-Object Name |
    Select-Object Name, Count |
    Format-Table -AutoSize
} else {
  [pscustomobject]@{ Name = "none"; Count = 0 } | Format-Table -AutoSize
}

Write-Host ""
Write-Host "COUNTS BY USAGE KIND" -ForegroundColor Cyan

if ($Rows.Count -gt 0) {
  $Rows |
    Group-Object UsageKind |
    Sort-Object Name |
    Select-Object Name, Count |
    Format-Table -AutoSize
} else {
  [pscustomobject]@{ Name = "none"; Count = 0 } | Format-Table -AutoSize
}

Write-Host ""
Write-Host "ACTIONABLE FINDINGS" -ForegroundColor Cyan

$RedRows = @($Rows | Where-Object Severity -eq "RED")
$YellowRows = @($Rows | Where-Object Severity -eq "YELLOW")
$DirectUserFacing = @($Rows | Where-Object { $_.UsageKind -eq "direct_fetch" -and $_.SurfaceClass -eq "active_user_facing_surface" })
$DirectOwner = @($Rows | Where-Object { $_.UsageKind -eq "direct_fetch" -and $_.SurfaceClass -eq "owner_admin_diagnostic" })
$TextOnly = @($Rows | Where-Object { $_.UsageKind -ne "direct_fetch" })

if ($RedRows.Count -gt 0) {
  Write-Host "RED: active user-facing direct chat endpoint usage remains." -ForegroundColor Red
  $RedRows | Format-List
} else {
  Write-Host "GREEN: no active user-facing unadapted direct chat endpoint fetches found." -ForegroundColor Green
}

if ($YellowRows.Count -gt 0) {
  Write-Host ""
  Write-Host "YELLOW: review remaining owner/admin or unknown direct endpoint references." -ForegroundColor Yellow
  $YellowRows | Format-Table Path, Line, Endpoint, UsageKind, SurfaceClass, Detail -AutoSize
}

Write-Host ""
Write-Host "CLEANUP SUMMARY" -ForegroundColor Cyan

$Total = @($Rows).Count
$Green = @($Rows | Where-Object Severity -eq "GREEN").Count
$Yellow = @($Rows | Where-Object Severity -eq "YELLOW").Count
$Red = @($Rows | Where-Object Severity -eq "RED").Count

[pscustomobject]@{
  TotalEndpointReferences = $Total
  Green = $Green
  Yellow = $Yellow
  Red = $Red
  ActiveUserFacingDirectFetches = @($DirectUserFacing).Count
  OwnerAdminDirectFetches = @($DirectOwner).Count
  TextOnlyReferences = @($TextOnly).Count
  Meaning = "RED means migrate now. YELLOW means review or intentionally allow as owner/admin diagnostic. GREEN means safe, legacy, text-only, API/server, or adapter protected."
  Next = "If only owner/admin diagnostic references remain, add allowlist guard or migrate those panels separately."
} | Format-List

if ($Red -gt 0) {
  throw "Direct chat endpoint cleanup report found RED active user-facing direct endpoint usage."
}

if ($Strict -and $Yellow -gt 0) {
  throw "Strict cleanup report found YELLOW references requiring review."
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
Write-Host "GREEN: direct chat endpoint cleanup report complete" -ForegroundColor Green
