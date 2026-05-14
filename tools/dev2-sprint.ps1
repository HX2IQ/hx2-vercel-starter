param(
  [Parameter(Mandatory=$true)]
  [string]$FeatureName
)

$ErrorActionPreference = "Stop"

function Invoke-Dev2Cleanup {
  Write-Host ""
  Write-Host "== DEV2 CLEANUP ==" -ForegroundColor Cyan

  $paths = @(
    "tools\last-build-error.log",
    ".next",
    ".next\cache\webpack",
    "tools\dev2\runs",
    "tools\dev2\sprint-reports"
  )

  foreach ($p in $paths) {
    if (Test-Path $p) {
      try {
        Remove-Item $p -Recurse -Force -ErrorAction Stop
        Write-Host "Removed: $p" -ForegroundColor DarkGray
      } catch {
        Write-Host "Skip cleanup: $p" -ForegroundColor DarkYellow
      }
    }
  }
}

Write-Host ""
Write-Host "HX2 DEV2 SPRINT START" -ForegroundColor Cyan
Write-Host "Feature: $FeatureName"

Invoke-Dev2Cleanup

$statusBefore = @(git status --short)

if ($statusBefore.Count -gt 0) {
  Write-Host ""
  Write-Host "== Dirty Tree Detected Before Sprint ==" -ForegroundColor Yellow
  $statusBefore
  Write-Host "Commit, stash, or intentionally include these changes before patching." -ForegroundColor Yellow
}

powershell -ExecutionPolicy Bypass -File .\tools\dev2-feature-compiler.ps1 -FeatureName $FeatureName

$ReportDir = "tools\dev2\sprint-reports"
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

$statusAfter = @(git status --short)

$ReportPath = Join-Path $ReportDir "$((Get-Date).ToString('yyyyMMdd-HHmmss'))-$FeatureName.json"

@{
  feature = $FeatureName
  status = if ($statusAfter.Count -gt 0) { "file_changes_detected" } else { "no_file_changes" }
  time = (Get-Date).ToString("o")
  git_status = $statusAfter
  next = if ($statusAfter.Count -gt 0) {
    "Run build, master guard, commit changed files, then safe deploy."
  } else {
    "No file changes detected. Sprint did not count as an implementation."
  }
} | ConvertTo-Json -Depth 10 | Set-Content $ReportPath -Encoding UTF8

Write-Host ""
Write-Host "Sprint report: $ReportPath" -ForegroundColor Cyan

if ($statusAfter.Count -gt 0) {
  Write-Host ""
  Write-Host "SPRINT PRODUCED FILE CHANGES" -ForegroundColor Green
  Write-Host ""
  Write-Host "Run these commands next:" -ForegroundColor Yellow
  Write-Host "npm run build"
  Write-Host "npm run hx2:guard"
  Write-Host "git status --short"

  foreach ($f in $statusAfter) {
    $file = ($f -replace '^\s*[MADRCU\?]+\s+', '').Trim()
    if ($file) {
      Write-Host "git add `"$file`""
    }
  }

  Write-Host 'git commit -m "Describe verified sprint change"'
  Write-Host "npm run hx2:ship"
  Write-Host "npm run hx2:guard"
  Write-Host "git status --short"
} else {
  Write-Host ""
  Write-Host "NO FILE CHANGES - SPRINT DID NOT COUNT" -ForegroundColor Yellow
  Write-Host "This sprint only produced preflight/planning output." -ForegroundColor Yellow
  Write-Host "Apply a real file-changing patch, then rerun build and guards." -ForegroundColor Yellow
}
