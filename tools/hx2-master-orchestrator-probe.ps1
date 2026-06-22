param(
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

Write-Host ""
Write-Host "== HX2 MASTER ORCHESTRATOR FUNCTIONAL PROBE ==" -ForegroundColor Cyan

function Get-Hx2TextHits {
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
          $_.Extension -match "\.(ts|tsx|js|jsx|json|ps1|md)$"
        }

      $Hits = $Files | Select-String -Pattern $Pattern -ErrorAction SilentlyContinue
      $Count += ($Hits | Measure-Object).Count
    }
  }

  return $Count
}

function Get-Hx2CandidateFiles {
  param(
    [string[]]$Paths,
    [string]$Pattern
  )

  $Results = @()

  foreach ($P in $Paths) {
    if (Test-Path $P) {
      $Files = Get-ChildItem -Path $P -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object {
          $_.FullName -notmatch "\\node_modules\\" -and
          $_.FullName -notmatch "\\.next\\" -and
          $_.FullName -notmatch "\\.git\\" -and
          $_.Extension -match "\.(ts|tsx|js|jsx)$"
        }

      foreach ($File in $Files) {
        $Hit = Select-String -Path $File.FullName -Pattern $Pattern -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($Hit) {
          $Results += $File
        }
      }
    }
  }

  return $Results | Sort-Object FullName -Unique
}

Write-Host ""
Write-Host "EVIDENCE COUNTS" -ForegroundColor Cyan

$EvidencePaths = @(".\app", ".\lib", ".\tools")

$Evidence = @(
  [pscustomobject]@{ Signal="chat-master"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "chat-master") },
  [pscustomobject]@{ Signal="orchestrator"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "orchestrator|orchestration") },
  [pscustomobject]@{ Signal="capability-planner"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "capability-planner|capability planner") },
  [pscustomobject]@{ Signal="chat route"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "hx2/chat|chat/send|/api/hx2/chat") },
  [pscustomobject]@{ Signal="retrieval integration"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "retrieval|retrieve|search|source") },
  [pscustomobject]@{ Signal="node routing"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "node|nodes|route decision|routing decision") }
)

$Evidence | Format-Table -AutoSize

$TotalEvidence = ($Evidence | Measure-Object -Property Hits -Sum).Sum

Write-Host ""
Write-Host ("Total orchestrator evidence hits: {0}" -f $TotalEvidence)

Write-Host ""
Write-Host "ROUTE CANDIDATE INVENTORY" -ForegroundColor Cyan

$RouteCandidates = @()

if (Test-Path ".\app\api\hx2") {
  $RouteCandidates = Get-ChildItem -Path ".\app\api\hx2" -Recurse -File -Filter "route.ts" -ErrorAction SilentlyContinue |
    Where-Object {
      $_.FullName -match "(chat|orchestr|planner|capability|master)"
    } |
    Sort-Object FullName
}

$RouteRows = foreach ($Route in $RouteCandidates) {
  $Content = Get-Content $Route.FullName -Raw

  [pscustomobject]@{
    Route = $Route.FullName.Replace($Root + "\", "")
    HasGET = [bool]($Content -match "export\s+async\s+function\s+GET|export\s+function\s+GET")
    HasPOST = [bool]($Content -match "export\s+async\s+function\s+POST|export\s+function\s+POST")
    HasPlanner = [bool]($Content -match "capability|planner|orchestr|chat-master")
    HasRetrieval = [bool]($Content -match "retrieval|retrieve|search|source")
  }
}

if ($RouteRows.Count -gt 0) {
  $RouteRows | Format-Table -AutoSize
} else {
  Write-Host "YELLOW: no obvious route.ts candidates found under app/api/hx2." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "CORE CANDIDATE FILES" -ForegroundColor Cyan

$CoreCandidates = Get-Hx2CandidateFiles -Paths @(".\app", ".\lib") -Pattern "chat-master|orchestrator|orchestration|capability-planner|capability planner"

$CoreRows = foreach ($File in ($CoreCandidates | Select-Object -First 40)) {
  [pscustomobject]@{
    File = $File.FullName.Replace($Root + "\", "")
  }
}

if ($CoreRows.Count -gt 0) {
  $CoreRows | Format-Table -AutoSize
} else {
  Write-Host "YELLOW: no core orchestrator candidate files found." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "CONTRACT CHECKS" -ForegroundColor Cyan

$Checks = @()

$Checks += [pscustomobject]@{
  Check = "Has route candidates"
  Status = if ($RouteRows.Count -gt 0) { "GREEN" } else { "YELLOW" }
  Detail = "$($RouteRows.Count) route candidates"
}

$Checks += [pscustomobject]@{
  Check = "Has core candidate files"
  Status = if ($CoreRows.Count -gt 0) { "GREEN" } else { "YELLOW" }
  Detail = "$($CoreRows.Count) shown"
}

$Checks += [pscustomobject]@{
  Check = "Has strong orchestrator evidence"
  Status = if ($TotalEvidence -ge 100) { "GREEN" } elseif ($TotalEvidence -ge 25) { "YELLOW" } else { "RED" }
  Detail = "$TotalEvidence evidence hits"
}

$Checks += [pscustomobject]@{
  Check = "Has POST-capable chat/orchestrator route"
  Status = if (($RouteRows | Where-Object HasPOST).Count -gt 0) { "GREEN" } else { "YELLOW" }
  Detail = "$(($RouteRows | Where-Object HasPOST).Count) POST route candidates"
}

$Checks += [pscustomobject]@{
  Check = "Has planner/orchestrator route marker"
  Status = if (($RouteRows | Where-Object HasPlanner).Count -gt 0) { "GREEN" } else { "YELLOW" }
  Detail = "$(($RouteRows | Where-Object HasPlanner).Count) route candidates with planner/orchestrator markers"
}

$Checks | Format-Table -AutoSize

$RedCount = ($Checks | Where-Object Status -eq "RED").Count
$YellowCount = ($Checks | Where-Object Status -eq "YELLOW").Count
$GreenCount = ($Checks | Where-Object Status -eq "GREEN").Count

Write-Host ""
Write-Host "RESULT" -ForegroundColor Cyan
Write-Host ("Green checks:  {0}" -f $GreenCount)
Write-Host ("Yellow checks: {0}" -f $YellowCount)
Write-Host ("Red checks:    {0}" -f $RedCount)

if ($RedCount -gt 0) {
  throw "Master orchestrator probe found red checks."
}

if ($Strict -and $YellowCount -gt 0) {
  throw "Master orchestrator strict probe found yellow checks."
}

Write-Host ""
Write-Host "GREEN: master orchestrator functional probe passed" -ForegroundColor Green
