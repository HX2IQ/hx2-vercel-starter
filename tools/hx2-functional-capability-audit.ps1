param(
  [string]$Base = "",
  [switch]$SkipLive
)

$ErrorActionPreference = "Continue"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

if ([string]::IsNullOrWhiteSpace($Base)) {
  if (-not [string]::IsNullOrWhiteSpace($env:NEXT_PUBLIC_APP_URL)) {
    $Base = $env:NEXT_PUBLIC_APP_URL
  } elseif (-not [string]::IsNullOrWhiteSpace($env:NEXT_PUBLIC_SITE_URL)) {
    $Base = $env:NEXT_PUBLIC_SITE_URL
  } else {
    $Base = "https://optinodeiq.com"
  }
}

$Base = $Base.TrimEnd("/")

Write-Host ""
Write-Host "== HX2 FUNCTIONAL CAPABILITY AUDIT ==" -ForegroundColor Cyan
Write-Host ("Base:      {0}" -f $Base)
Write-Host ("Skip live: {0}" -f [bool]$SkipLive)

function Get-Hx2PackageScriptExists {
  param([string]$Name)

  try {
    $Pkg = Get-Content ".\package.json" -Raw | ConvertFrom-Json
    return ($Pkg.scripts.PSObject.Properties.Name -contains $Name)
  } catch {
    return $false
  }
}

function Get-Hx2EvidenceHits {
  param(
    [string[]]$Paths,
    [string]$Pattern
  )

  $Count = 0

  foreach ($P in $Paths) {
    if (Test-Path $P) {
      $Files = Get-ChildItem -Path $P -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object {
          $_.FullName -notmatch "\\node_modules\\" -and
          $_.FullName -notmatch "\\.next\\" -and
          $_.FullName -notmatch "\\.git\\" -and
          $_.Extension -match "\.(ts|tsx|js|jsx|json|ps1|md|prisma)$"
        }

      $Hits = $Files | Select-String -Pattern $Pattern -ErrorAction SilentlyContinue
      $Count += ($Hits | Measure-Object).Count
    }
  }

  return $Count
}

function Test-Hx2LiveJsonEndpoint {
  param(
    [string]$Path,
    [string]$ExpectedRoute = ""
  )

  if ($SkipLive) {
    return [pscustomobject]@{
      Path = $Path
      Status = "SKIPPED"
      Detail = "live checks skipped"
    }
  }

  $Url = "$Base$Path"

  try {
    $Response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 30

    if ($ExpectedRoute -and $Response.route -and $Response.route -ne $ExpectedRoute) {
      return [pscustomobject]@{
        Path = $Path
        Status = "YELLOW"
        Detail = "responded, but route mismatch: $($Response.route)"
      }
    }

    if ($Response.ok -eq $false) {
      return [pscustomobject]@{
        Path = $Path
        Status = "YELLOW"
        Detail = "responded with ok=false"
      }
    }

    return [pscustomobject]@{
      Path = $Path
      Status = "GREEN"
      Detail = "live JSON endpoint responded"
    }
  } catch {
    return [pscustomobject]@{
      Path = $Path
      Status = "RED"
      Detail = $_.Exception.Message
    }
  }
}

function Test-Hx2ProbeScript {
  param(
    [string]$ScriptPath,
    [string]$Command
  )

  $Exists = Test-Path $ScriptPath
  $ScriptExists = if ([string]::IsNullOrWhiteSpace($Command)) { $false } else { Get-Hx2PackageScriptExists -Name $Command }

  if ($Exists -and $ScriptExists) {
    return "GREEN"
  }

  if ($Exists -or $ScriptExists) {
    return "YELLOW"
  }

  return "RED"
}

Write-Host ""
Write-Host "LIVE READ-ONLY ENDPOINTS" -ForegroundColor Cyan

$LiveEndpointResults = @()
$LiveEndpointResults += Test-Hx2LiveJsonEndpoint -Path "/api/hx2/deployment-status" -ExpectedRoute "/api/hx2/deployment-status"
$LiveEndpointResults += Test-Hx2LiveJsonEndpoint -Path "/api/hx2/owner-status" -ExpectedRoute "/api/hx2/owner-status"
$LiveEndpointResults += Test-Hx2LiveJsonEndpoint -Path "/api/hx2/retrieval-status" -ExpectedRoute "/api/hx2/retrieval-status"

$LiveEndpointResults | Format-Table -AutoSize

$LiveGreen = ($LiveEndpointResults | Where-Object Status -eq "GREEN").Count

Write-Host ""
Write-Host "LOCAL PROBE/SCRIPT COVERAGE" -ForegroundColor Cyan

$ProbeRows = @(
  [pscustomobject]@{ Layer="Deployment visibility"; Script="tools/hx2-deployment-status-probe.ps1"; Npm="hx2:deployment:status"; Status=(Test-Hx2ProbeScript "tools/hx2-deployment-status-probe.ps1" "hx2:deployment:status") },
  [pscustomobject]@{ Layer="Deployment sync"; Script="tools/hx2-deployment-sync.ps1"; Npm="hx2:deployment:sync"; Status=(Test-Hx2ProbeScript "tools/hx2-deployment-sync.ps1" "hx2:deployment:sync") },
  [pscustomobject]@{ Layer="Owner API"; Script="tools/hx2-owner-status-probe.ps1"; Npm="hx2:owner:status"; Status=(Test-Hx2ProbeScript "tools/hx2-owner-status-probe.ps1" "hx2:owner:status") },
  [pscustomobject]@{ Layer="Owner UI"; Script="tools/hx2-owner-status-ui-probe.ps1"; Npm="hx2:owner:status:ui"; Status=(Test-Hx2ProbeScript "tools/hx2-owner-status-ui-probe.ps1" "hx2:owner:status:ui") },
  [pscustomobject]@{ Layer="Retrieval status"; Script="tools/hx2-retrieval-status-probe.ps1"; Npm="hx2:retrieval:status"; Status=(Test-Hx2ProbeScript "tools/hx2-retrieval-status-probe.ps1" "hx2:retrieval:status") },
  [pscustomobject]@{ Layer="Auto verify"; Script="tools/hx2-verify-auto.ps1"; Npm="hx2:verify:auto"; Status=(Test-Hx2ProbeScript "tools/hx2-verify-auto.ps1" "hx2:verify:auto") },
  [pscustomobject]@{ Layer="Owner UI speed lane"; Script="tools/hx2-owner-ui-verify.ps1"; Npm="hx2:verify:owner-ui"; Status=(Test-Hx2ProbeScript "tools/hx2-owner-ui-verify.ps1" "hx2:verify:owner-ui") }
)

$ProbeRows | Format-Table -AutoSize

Write-Host ""
Write-Host "CAPABILITY EVIDENCE AND FUNCTIONAL READINESS" -ForegroundColor Cyan

$Areas = @(
  [pscustomobject]@{
    Layer="Owner control tower"
    Paths=@(".\app", ".\tools")
    Pattern="owner-status|owner dashboard|Owner Visibility|OwnerQuickLinks"
    RequiredLive=@("/api/hx2/owner-status")
    RequiredProbe="hx2:owner:status"
  },
  [pscustomobject]@{
    Layer="Deployment visibility"
    Paths=@(".\app", ".\tools")
    Pattern="deployment-status|deployment-sync|VERCEL_GIT_COMMIT|Deployment Freshness"
    RequiredLive=@("/api/hx2/deployment-status")
    RequiredProbe="hx2:deployment:status"
  },
  [pscustomobject]@{
    Layer="Retrieval foundation"
    Paths=@(".\app", ".\tools")
    Pattern="retrieval-status|youtube|web-local-first|retrieval-quality|local-first"
    RequiredLive=@("/api/hx2/retrieval-status")
    RequiredProbe="hx2:retrieval:status"
  },
  [pscustomobject]@{
    Layer="DEV2 / verification"
    Paths=@(".\tools", ".\package.json")
    Pattern="verify-auto|quick-verify|owner-ui-verify|deployment-sync|guard|DEV2"
    RequiredLive=@()
    RequiredProbe="hx2:verify:auto"
  },
  [pscustomobject]@{
    Layer="Master orchestrator / chat brain"
    Paths=@(".\app", ".\lib", ".\tools")
    Pattern="chat-master|orchestrator|capability-planner|planner|chat/send|hx2/chat"
    RequiredLive=@()
    RequiredProbe="hx2:master:orchestrator:probe"
  },
  [pscustomobject]@{
    Layer="KGX / memory / graph"
    Paths=@(".\app", ".\lib", ".\tools", ".\prisma")
    Pattern="kgx|knowledge|memory|graph|persistent-runtime-memory"
    RequiredLive=@()
    RequiredProbe="hx2:kgx:memory:probe"
  },
  [pscustomobject]@{
    Layer="Worker / queue / execution"
    Paths=@(".\app", ".\lib", ".\tools")
    Pattern="queue|worker|redis|upstash|execution|task|autonomous-execution"
    RequiredLive=@()
    RequiredProbe="hx2:worker:execution:probe"
  },
  [pscustomobject]@{
    Layer="Auth / billing / accounts"
    Paths=@(".\app", ".\lib", ".\prisma")
    Pattern="auth|billing|stripe|subscription|account|login|session"
    RequiredLive=@()
    RequiredProbe="hx2:auth:billing:probe"
  }
)

$CapabilityRows = foreach ($A in $Areas) {
  $Hits = Get-Hx2EvidenceHits -Paths $A.Paths -Pattern $A.Pattern
  $ProbeStatus = if ([string]::IsNullOrWhiteSpace($A.RequiredProbe)) { "NONE" } elseif (Get-Hx2PackageScriptExists $A.RequiredProbe) { "GREEN" } else { "MISSING" }

  $LiveStatus = "NONE"
  if ($A.RequiredLive.Count -gt 0) {
    $LiveStatuses = foreach ($P in $A.RequiredLive) {
      ($LiveEndpointResults | Where-Object Path -eq $P | Select-Object -First 1).Status
    }

    if ($LiveStatuses -contains "RED") {
      $LiveStatus = "RED"
    } elseif ($LiveStatuses -contains "YELLOW") {
      $LiveStatus = "YELLOW"
    } elseif ($LiveStatuses -contains "GREEN") {
      $LiveStatus = "GREEN"
    }
  }

  $FunctionalStatus = "RED"
  $FunctionalMeaning = "missing or not enough local evidence"

  if ($Hits -ge 25 -and ($LiveStatus -eq "GREEN" -or $ProbeStatus -eq "GREEN")) {
    $FunctionalStatus = "GREEN"
    $FunctionalMeaning = "live/probed foundation exists"
  } elseif ($Hits -ge 25) {
    $FunctionalStatus = "YELLOW"
    $FunctionalMeaning = "strong local evidence; needs live/probe proof"
  } elseif ($Hits -gt 0) {
    $FunctionalStatus = "YELLOW"
    $FunctionalMeaning = "early local evidence; needs implementation/probes"
  }

  [pscustomobject]@{
    Layer = $A.Layer
    EvidenceHits = $Hits
    Probe = $ProbeStatus
    Live = $LiveStatus
    Status = $FunctionalStatus
    Meaning = $FunctionalMeaning
  }
}

$CapabilityRows | Format-Table -AutoSize

Write-Host ""
Write-Host "COMPLETION READ" -ForegroundColor Cyan

$GreenFunctional = ($CapabilityRows | Where-Object Status -eq "GREEN").Count
$YellowFunctional = ($CapabilityRows | Where-Object Status -eq "YELLOW").Count
$RedFunctional = ($CapabilityRows | Where-Object Status -eq "RED").Count
$TotalFunctional = $CapabilityRows.Count

[pscustomobject]@{
  "Functional green layers" = "$GreenFunctional / $TotalFunctional"
  "Functional yellow layers" = "$YellowFunctional / $TotalFunctional"
  "Functional red layers" = "$RedFunctional / $TotalFunctional"
  "Read" = "GREEN = proven foundation; YELLOW = code exists but needs live/probe proof; RED = missing"
  "Recommended next" = "Add probes for YELLOW layers before claiming retail readiness"
} | Format-List

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
Write-Host "GREEN: functional capability audit complete" -ForegroundColor Green
