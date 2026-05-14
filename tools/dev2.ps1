[CmdletBinding()]
param(
  [ValidateSet("stb","health","smoke","autopsy","diff","enqueue","poll","all")]
  [string]$Mode = "stb",

  [string]$Base = $env:HX2_BASE_URL,
  [string]$ApiKey = $env:HX2_API_KEY,

  [string]$Vps = $env:HX2_VPS,

  [string]$Task = "ping",
  [string]$TaskId = "",
  [int]$PollSeconds = 60
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Say([string]$msg){ Write-Host ("[DEV2] " + $msg) }

function RequireFile([string]$p){
  if (-not (Test-Path $p)) { throw "Missing required file: $p" }
}

function MaybeRun([string]$p, [string[]]$args=@()){
  if (Test-Path $p) {
    Say "Running: $p $($args -join ' ')"
    & $p @args
  } else {
    Say "SKIP (missing): $p"
  }
}

function Normalize-Base([string]$b){
  if ([string]::IsNullOrWhiteSpace($b)) { return "" }
  return $b.TrimEnd("/")
}

# Defaults
$Base = Normalize-Base $Base
if (-not $Base) { $Base = "https://optinodeiq.com" }
if (-not $Vps)  { $Vps  = $env:Vps }  # allow user aliasing

Say "Mode=$Mode Base=$Base Vps=$Vps Task=$Task TaskId=$TaskId"

# Paths to existing DEV2 scripts (from your STB library)
$Smoke   = ".\tools\smoke-ap2.ps1"
$Autopsy = ".\tools\stb-autopsy.ps1"
$AutopsyToFile = ".\tools\stb-autopsy-tofile.ps1"
$DiffEnv = ".\tools\stb-diff-env.ps1"
$Verify  = ".\tools\stb-verify-tools.ps1"
$Enqueue = ".\tools\enqueue-ap2-task.ps1"
$Poll    = ".\tools\poll-ap2-task.ps1"

# --- DEV2 default routine (proof-first, minimal-change) ---
# 1) Verify local tooling exists
# 2) Smoke check (API surface + enqueue/status)
# 3) If failure: autopsy bundle (logs/env snapshot) BEFORE patching anything
# 4) Only then isolate failure class + minimal patch
switch ($Mode) {
  "health" {
    MaybeRun $Verify
    exit 0
  }

  "smoke" {
    MaybeRun $Smoke @("-Base", $Base, "-ApiKey", $ApiKey, "-Vps", $Vps)
    exit 0
  }

  "diff" {
    MaybeRun $DiffEnv @("-Vps", $Vps)
    exit 0
  }

  "autopsy" {
    # Prefer to-file version if present (creates persistent bundle)
    if (Test-Path $AutopsyToFile) {
      MaybeRun $AutopsyToFile @("-Vps", $Vps)
    } else {
      MaybeRun $Autopsy @("-Vps", $Vps)
    }
    exit 0
  }

  "enqueue" {
    RequireFile $Enqueue
    & $Enqueue -Base $Base -ApiKey $ApiKey -Task $Task | Write-Output
    exit 0
  }

  "poll" {
    RequireFile $Poll
    if (-not $TaskId) { throw "poll mode requires -TaskId" }
    & $Poll -Base $Base -ApiKey $ApiKey -TaskId $TaskId -Seconds $PollSeconds | Write-Output
    exit 0
  }

  "all" {
    MaybeRun $Verify
    MaybeRun $DiffEnv @("-Vps", $Vps)
    MaybeRun $Smoke @("-Base", $Base, "-ApiKey", $ApiKey, "-Vps", $Vps)
    exit 0
  }

  default { # "stb"
    MaybeRun $Verify
    $smokeOk = $true
    try {
      MaybeRun $Smoke @("-Base", $Base, "-ApiKey", $ApiKey, "-Vps", $Vps)
    } catch {
      $smokeOk = $false
      Say "SMOKE FAILED: $($_.Exception.Message)"
    }

    if (-not $smokeOk) {
      Say "Generating autopsy bundle BEFORE any patches..."
      if (Test-Path $AutopsyToFile) {
        MaybeRun $AutopsyToFile @("-Vps", $Vps)
      } else {
        MaybeRun $Autopsy @("-Vps", $Vps)
      }
      throw "DEV2.STB stop-the-bleeding complete: autopsy captured. Next step is isolate failure class based on bundle."
    }

    Say "DEV2.STB OK: smoke passed."
    exit 0
  }
}
