$File = ".\tools\hx2-owner-memory.json"
$data = Get-Content $File -Raw | ConvertFrom-Json

Write-Host ""
Write-Host "HX2 STATUS"
Write-Host "----------"
Write-Host "Phase: $($data.current_phase)"
Write-Host "Priority: $($data.current_priority)"
Write-Host "Next Sprint: $($data.next_sprint)"
Write-Host ""

Write-Host "Active Priorities:"
$data.active_priorities | ForEach-Object { Write-Host "- $_" }

Write-Host ""
Write-Host "Hot Files:"
$data.hot_files | ForEach-Object { Write-Host "- $_" }
