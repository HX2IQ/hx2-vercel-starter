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

function Invoke-ChatMasterProbe {
  param(
    [string]$Query
  )

  $Body = @{
    user_query = $Query
  } | ConvertTo-Json -Depth 8

  Invoke-RestMethod `
    -Uri "$Base/api/hx2/chat-master" `
    -Method POST `
    -ContentType "application/json" `
    -Body $Body
}

function Write-CompactYouTubeResult {
  param(
    [object]$Res
  )

  $Chosen = $Res.result.chosen_video
  $Search = $Res.result.search
  $Transcript = $Res.result.transcript

  [pscustomobject]@{
    ok = $Res.ok
    routed_to = $Res.routed_to
    result_source = $Res.result.source
    provider = $Search.provider
    result_count = $Search.n
    chosen_title = $Chosen.title
    chosen_title_is_generic = ([string]$Chosen.title) -match "^YouTube video "
    chosen_channel = $Chosen.channel
    chosen_video_id = $Chosen.video_id
    chosen_url = $Chosen.url
    transcript_ok = $Transcript.ok
    transcript_items = $Transcript.n
    transcript_chars = if ($Transcript.full_text) { ([string]$Transcript.full_text).Length } else { 0 }
  } | ConvertTo-Json -Depth 8
}

Write-Host "`n=============================="
Write-Host "CHECK: YouTube search routing"
Write-Host "=============================="

try {
  $Res = Invoke-SourceRouterProbe -Query "search youtube for XRP Ripple interview"
  Write-CompactYouTubeResult -Res $Res

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
  Write-CompactYouTubeResult -Res $Res

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
Write-Host "CHECK: Chat-master YouTube synthesis"
Write-Host "=============================="

try {
  $ExpectedVideoId = "dQw4w9WgXcQ"
  $Res = Invoke-ChatMasterProbe -Query "summarize this YouTube video https://www.youtube.com/watch?v=$ExpectedVideoId"
  $Answer = [string]$Res.answer

  [pscustomobject]@{
    ok = $Res.ok
    answer_chars = $Answer.Length
    has_youtube_footer = $Answer -match "HX2 YouTube Retrieval Intelligence"
    has_video_id = $Answer -match $ExpectedVideoId
    has_transcript_status = $Answer -match "Transcript:"
    title_is_generic = $Answer -match "Selected video: YouTube video "
    preview = if ($Answer.Length -gt 700) { $Answer.Substring(0, 700) + "..." } else { $Answer }
  } | ConvertTo-Json -Depth 8 | Write-Host

  if (-not $Answer) {
    Write-Host "`nFAIL: chat-master returned no answer"
    $Failures++
  }

  if ($Answer -notmatch "HX2 YouTube Retrieval Intelligence") {
    Write-Host "`nFAIL: chat-master did not use YouTube retrieval intelligence"
    $Failures++
  }

  if ($Answer -notmatch $ExpectedVideoId) {
    Write-Host "`nFAIL: chat-master answer did not include expected video id"
    $Failures++
  }

  if ($Answer -notmatch "Transcript:") {
    Write-Host "`nFAIL: chat-master answer did not include transcript status"
    $Failures++
  }

  if ($Answer -match "Never gonna give you up|Never gonna let you down|Never gonna run around") {
    Write-Host "`nFAIL: chat-master answer reproduced copyrighted transcript/lyrics"
    $Failures++
  }
}
catch {
  Write-Host "`nFAIL: Chat-master YouTube synthesis request failed"
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

