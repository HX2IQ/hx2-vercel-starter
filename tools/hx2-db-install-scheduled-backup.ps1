param(
  [string]$TaskName = "HX2 Daily Database Backup",
  [string]$RepoPath = "C:\Users\ezdet\hx2-vercel-starter",
  [string]$Time = "03:00"
)

$ErrorActionPreference = "Stop"

$JobScript = Join-Path $RepoPath "tools\hx2-daily-resilience-job.ps1"
$EnvFile = Join-Path $RepoPath ".env.recovery"

if (-not (Test-Path $JobScript)) {
  throw "Daily resilience job not found: $JobScript"
}

if (-not (Test-Path $EnvFile)) {
  throw "Env file not found: $EnvFile"
}

$PowerShellExe = "$PSHOME\powershell.exe"
if (-not (Test-Path $PowerShellExe)) {
  $PowerShellExe = "powershell.exe"
}

$Argument = "-NoProfile -ExecutionPolicy Bypass -File `"$JobScript`" -RepoPath `"$RepoPath`""

$Action = New-ScheduledTaskAction -Execute $PowerShellExe -Argument $Argument -WorkingDirectory $RepoPath
$Trigger = New-ScheduledTaskTrigger -Daily -At $Time
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Daily HX2 resilience chain: backup, health, mirror, restore-readiness." -Force | Out-Null

Write-Host "`nGREEN: Scheduled daily resilience task installed."
Write-Host "Task: $TaskName"
Write-Host "Time: $Time daily"
Write-Host "Job script: $JobScript"
Write-Host "Secrets printed: false"
