$File = ".\tools\hx2-benchmark-history.json"

$data = Get-Content $File -Raw | ConvertFrom-Json

$score = Read-Host "Enter total benchmark score (0-10)"

$row = [PSCustomObject]@{
  date = (Get-Date).ToString("yyyy-MM-dd")
  score = [double]$score
}

$arr = @($data)
$arr += $row

$arr | ConvertTo-Json -Depth 10 | Set-Content $File -Encoding UTF8

Write-Host ""
Write-Host "HX2 Benchmark History"
$arr | Format-Table -AutoSize
