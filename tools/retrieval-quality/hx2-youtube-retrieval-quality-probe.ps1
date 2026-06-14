param(
  [string]$Base = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()

$Failures = 0

function Invoke-SourceRouterProbe {
  param(
    [string]$Query
  )

  $Body = @{
    q = $Query
    limit = 3
  } | ConvertTo-Json -Depth 8

  Invoke-RestMethod `
    -Uri "$Base/api/hx2/source-router" `
    -Method POST `
    -ContentType "application/json" `
    -Body $Body
}

Write-Host "`n=============================="
Write-Host "CHECK: YouTube search routing"
Write-Host "=============================="

try {
  $Res = Invoke-SourceRouterProbe -Query "search youtube for XRP Ripple interview"
  $Json = $Res | ConvertTo-Json -Depth 16
  Write-Host $Json

  if (-not $Res.ok) {
    Write-Host "`nFAIL: source-router did not return ok"
    $Failures++
  }

  if ($Res.routed_to -ne "youtube") {
    Write-Host "`nFAIL: source-router did not route to youtube"
    $Failures++
  }

  if (-not $Res.result.chosen_video.video_id) {
    Write-Host "`nFAIL: missing chosen video id"
    $Failures++
  }
}
catch {
  Write-Host "`nFAIL: YouTube search routing request failed"
  Write-Host $_.Exception.Message
  $Failures++
}

Write-Host "`n=============================="
Write-Host "CHECK: Direct YouTube URL routing"
Write-Host "=============================="

try {
  $ExpectedVideoId = "dQw4w9WgXcQ"
  $Res = Invoke-SourceRouterProbe -Query "summarize this YouTube video https://www.youtube.com/watch?v=$ExpectedVideoId"
  $Json = $Res | ConvertTo-Json -Depth 16
  Write-Host $Json

  if (-not $Res.ok) {
    Write-Host "`nFAIL: source-router did not return ok"
    $Failures++
  }

  if ($Res.routed_to -ne "youtube") {
    Write-Host "`nFAIL: source-router did not route direct URL to youtube"
    $Failures++
  }

  if ($Res.result.source -ne "youtube_direct") {
    Write-Host "`nFAIL: direct URL did not use youtube_direct source"
    $Failures++
  }

  if ($Res.result.chosen_video.video_id -ne $ExpectedVideoId) {
    Write-Host "`nFAIL: wrong direct video id. Expected $ExpectedVideoId, got $($Res.result.chosen_video.video_id)"
    $Failures++
  }

  if ($Res.result.search.provider -ne "direct_youtube_url") {
    Write-Host "`nFAIL: direct URL did not use direct_youtube_url provider"
    $Failures++
  }
}
catch {
  Write-Host "`nFAIL: Direct YouTube URL request failed"
  Write-Host $_.Exception.Message
  $Failures++
}

Write-Host "`n=============================="
Write-Host "YOUTUBE RETRIEVAL QUALITY RESULT"
Write-Host "=============================="

if ($Failures -gt 0) {
  Write-Host "FAILED with $Failures issue(s)."
  exit 1
}

Write-Host "PASSED"
exit 0
