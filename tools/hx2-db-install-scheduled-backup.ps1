param(
  [string]$TaskName = "HX2 Daily Database Backup",
  [string]$RepoPath = "C:\Users\ezdet\hx2-vercel-starter",
  [string]$Time = "03:00"
)

$ErrorActionPreference = "Stop"

$BackupScript = Join-Path $RepoPath "tools\hx2-db-backup.ps1"
$EnvFile = Join-Path $RepoPath ".env.recovery"

if (-not (Test-Path $BackupScript)) {
  throw "Backup script not found: $BackupScript"
}

if (-not (Test-Path $EnvFile)) {
  throw "Env file not found: $EnvFile"
}

$PowerShellExe = "$PSHOME\powershell.exe"
if (-not (Test-Path $PowerShellExe)) {
  $PowerShellExe = "powershell.exe"
}

$Argument = "-NoProfile -ExecutionPolicy Bypass -File `"$BackupScript`" -EnvFile `"$EnvFile`" -Label scheduled"

$Action = New-ScheduledTaskAction -Execute $PowerShellExe -Argument $Argument -WorkingDirectory $RepoPath
$Trigger = New-ScheduledTaskTrigger -Daily -At $Time
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Daily HX2 Postgres public-schema backup to C:\HX2-Backups\databases" -Force | Out-Null

Write-Host "`nGREEN: Scheduled task installed."
Write-Host "Task: $TaskName"
Write-Host "Time: $Time daily"
Write-Host "Backup script: $BackupScript"
Write-Host "Env file: $EnvFile"
Write-Host "Secrets printed: false"
