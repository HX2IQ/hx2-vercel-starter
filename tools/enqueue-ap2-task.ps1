param(
  [Parameter(Mandatory=$true)][string]$TaskType,
  [Parameter(Mandatory=$false)][hashtable]$Payload = @{},
  [Parameter(Mandatory=$false)][string]$Note = ""
)

$Base = $env:HX2_BASE_URL
if (-not $Base) { $Base = "https://optinodeiq.com" }

# If you already store your key somewhere else, set HX2_API_KEY in your session:
$Key = $env:HX2_API_KEY

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$uri = "$Base/api/ap2/task/enqueue?ts=$ts"

$bodyObj = @{
  mode = "SAFE"
  taskType = $TaskType
  payload = $Payload
  note = $Note
}
$bodyJson = ($bodyObj | ConvertTo-Json -Depth 20)

$headers = @{ "Content-Type" = "application/json" }
if ($Key) { $headers["Authorization"] = "Bearer $Key" }

try {
  $resp = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $bodyJson
  $resp | ConvertTo-Json -Depth 20
} catch {
  Write-Host "ENQUEUE FAILED:" -ForegroundColor Red
  if ($_.Exception.Response -and $_.Exception.Response.GetResponseStream) {
    $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $sr.ReadToEnd()
  } else {
    $_.Exception.Message
  }
  exit 1
}
