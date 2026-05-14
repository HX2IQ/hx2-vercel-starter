param(
  [string]$Deploy = "unknown",
  [string]$Next = "",
  [string]$Blocker = ""
)

$File = ".\tools\hx2-owner-memory.json"
$data = Get-Content $File -Raw | ConvertFrom-Json

$data.updated_utc = (Get-Date).ToUniversalTime().ToString("s") + "Z"
$data.last_successful_deploy = $Deploy

$commit = git rev-parse --short HEAD 2>$null
if ($commit) { $data | Add-Member -NotePropertyName last_commit -NotePropertyValue $commit -Force }

if ($Next -ne "") { $data.next_sprint = $Next }

if ($Blocker -ne "") {
  $arr = @($data.known_blockers)
  $arr += $Blocker
  $data.known_blockers = $arr | Select-Object -Unique
}

$data | ConvertTo-Json -Depth 20 | Set-Content $File -Encoding UTF8

Write-Host "HX2 memory updated."
