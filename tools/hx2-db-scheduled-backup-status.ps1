param(
  [string]$TaskName = "HX2 Daily Database Backup"
)

$ErrorActionPreference = "Stop"

$Task = Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop

Write-Host "`n== HX2 SCHEDULED BACKUP TASK =="
Write-Host "TaskName: $($Task.TaskName)"
Write-Host "State:    $($Task.State)"

Write-Host "`n== TASK INFO =="
Get-ScheduledTaskInfo -TaskName $TaskName | Format-List

Write-Host "`nGREEN: Scheduled backup task is registered."
