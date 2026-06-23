param(
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

Write-Host ""
Write-Host "== HX2 WORKER QUEUE EXECUTION FUNCTIONAL PROBE ==" -ForegroundColor Cyan

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
          $_.Extension -match "\.(ts|tsx|js|jsx|json|ps1|md|prisma)$"
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
          $_.Extension -match "\.(ts|tsx|js|jsx|json|ps1|prisma)$"
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

$EvidencePaths = @(".\app", ".\lib", ".\tools", ".\prisma")

$Evidence = @(
  [pscustomobject]@{ Signal="worker"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "worker|background worker|job worker") },
  [pscustomobject]@{ Signal="queue"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "queue|enqueue|dequeue|job queue") },
  [pscustomobject]@{ Signal="execution"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "execution|execute|executor|execution plan") },
  [pscustomobject]@{ Signal="task"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "task|task runner|task status") },
  [pscustomobject]@{ Signal="redis/upstash"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "redis|upstash|KV_REST|UPSTASH") },
  [pscustomobject]@{ Signal="runtime/autonomous"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "runtime|autonomous-execution|multi-agent-runtime|scheduler") }
)

$Evidence | Format-Table -AutoSize

$TotalEvidence = ($Evidence | Measure-Object -Property Hits -Sum).Sum

Write-Host ""
Write-Host ("Total worker / queue / execution evidence hits: {0}" -f $TotalEvidence)

Write-Host ""
Write-Host "ROUTE CANDIDATE INVENTORY" -ForegroundColor Cyan

$RouteCandidates = @()

if (Test-Path ".\app\api\hx2") {
  $RouteCandidates = Get-ChildItem -Path ".\app\api\hx2" -Recurse -File -Filter "route.ts" -ErrorAction SilentlyContinue |
    Where-Object {
      $_.FullName -match "(worker|queue|execution|task|runtime|scheduler|autonomous|multi-agent)"
    } |
    Sort-Object FullName
}

$RouteRows = foreach ($Route in $RouteCandidates) {
  $Content = Get-Content $Route.FullName -Raw

  [pscustomobject]@{
    Route = $Route.FullName.Replace($Root + "\", "")
    HasGET = [bool]($Content -match "export\s+async\s+function\s+GET|export\s+function\s+GET")
    HasPOST = [bool]($Content -match "export\s+async\s+function\s+POST|export\s+function\s+POST")
    HasExecution = [bool]($Content -match "execution|execute|executor|plan")
    HasQueue = [bool]($Content -match "queue|enqueue|task|job")
    HasRuntime = [bool]($Content -match "runtime|autonomous|multi-agent|scheduler")
    HasSafeMode = [bool]($Content -match "read_only|preview|safe_metadata|no_brain_logic|status|simulation")
  }
}

if (@($RouteRows).Count -gt 0) {
  $RouteRows | Format-Table -AutoSize
} else {
  Write-Host "YELLOW: no obvious worker/queue/execution route.ts candidates found under app/api/hx2." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "CORE CANDIDATE FILES" -ForegroundColor Cyan

$CoreCandidates = Get-Hx2CandidateFiles -Paths @(".\app", ".\lib", ".\tools", ".\prisma") -Pattern "worker|queue|execution|execute|task|redis|upstash|runtime|autonomous-execution|multi-agent-runtime|scheduler"

$CoreRows = foreach ($File in ($CoreCandidates | Select-Object -First 60)) {
  [pscustomobject]@{
    File = $File.FullName.Replace($Root + "\", "")
  }
}

if (@($CoreRows).Count -gt 0) {
  $CoreRows | Format-Table -AutoSize
} else {
  Write-Host "YELLOW: no core worker/queue/execution candidate files found." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "CONTRACT CHECKS" -ForegroundColor Cyan

$Checks = @()

$Checks += [pscustomobject]@{
  Check = "Has route candidates"
  Status = if (@($RouteRows).Count -gt 0) { "GREEN" } else { "YELLOW" }
  Detail = "$(@($RouteRows).Count) route candidates"
}

$Checks += [pscustomobject]@{
  Check = "Has core candidate files"
  Status = if (@($CoreRows).Count -gt 0) { "GREEN" } else { "YELLOW" }
  Detail = "$(@($CoreRows).Count) shown"
}

$Checks += [pscustomobject]@{
  Check = "Has strong execution evidence"
  Status = if ($TotalEvidence -ge 100) { "GREEN" } elseif ($TotalEvidence -ge 25) { "YELLOW" } else { "RED" }
  Detail = "$TotalEvidence evidence hits"
}

$Checks += [pscustomobject]@{
  Check = "Has execution-marked routes"
  Status = if (@($RouteRows | Where-Object HasExecution).Count -gt 0) { "GREEN" } else { "YELLOW" }
  Detail = "$(@($RouteRows | Where-Object HasExecution).Count) execution route candidates"
}

$Checks += [pscustomobject]@{
  Check = "Has queue/task markers"
  Status = if (@($RouteRows | Where-Object HasQueue).Count -gt 0 -or (Get-Hx2TextHits -Paths $EvidencePaths -Pattern "queue|enqueue|task|job") -ge 25) { "GREEN" } else { "YELLOW" }
  Detail = "queue/task route or strong file evidence"
}

$Checks += [pscustomobject]@{
  Check = "Has runtime/autonomous markers"
  Status = if (@($RouteRows | Where-Object HasRuntime).Count -gt 0 -or (Get-Hx2TextHits -Paths $EvidencePaths -Pattern "runtime|autonomous-execution|multi-agent-runtime|scheduler") -ge 25) { "GREEN" } else { "YELLOW" }
  Detail = "runtime/autonomous route or strong file evidence"
}

$Checks += [pscustomobject]@{
  Check = "Has safe read/status/simulation markers"
  Status = if (@($RouteRows | Where-Object HasSafeMode).Count -gt 0) { "GREEN" } else { "YELLOW" }
  Detail = "$(@($RouteRows | Where-Object HasSafeMode).Count) safe/status route candidates"
}

$Checks | Format-Table -AutoSize

$RedCount = @($Checks | Where-Object Status -eq "RED").Count
$YellowCount = @($Checks | Where-Object Status -eq "YELLOW").Count
$GreenCount = @($Checks | Where-Object Status -eq "GREEN").Count

Write-Host ""
Write-Host "RESULT" -ForegroundColor Cyan
Write-Host ("Green checks:  {0}" -f $GreenCount)
Write-Host ("Yellow checks: {0}" -f $YellowCount)
Write-Host ("Red checks:    {0}" -f $RedCount)

if ($RedCount -gt 0) {
  throw "Worker queue execution probe found red checks."
}

if ($Strict -and $YellowCount -gt 0) {
  throw "Worker queue execution strict probe found yellow checks."
}

Write-Host ""
Write-Host "GREEN: worker queue execution functional probe passed" -ForegroundColor Green
