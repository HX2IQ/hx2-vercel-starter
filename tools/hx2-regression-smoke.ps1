param(
  [string]$Base = "https://optinodeiq.com",
  [string]$Hx2ApiKey = $env:HX2_API_KEY
)

$ErrorActionPreference = "Stop"

if (-not $Hx2ApiKey) {
  throw "HX2_API_KEY is missing. Set it in the environment or pass -Hx2ApiKey."
}

$Auth = "Bearer $Hx2ApiKey"
$Headers = @{
  Authorization = $Auth
  "Content-Type" = "application/json"
}

$results = New-Object System.Collections.Generic.List[object]

function Add-Result {
  param(
    [string]$Test,
    [string]$Status,
    [string]$Detail
  )
  $results.Add([pscustomobject]@{
    test   = $Test
    status = $Status
    detail = $Detail
  }) | Out-Null
}

function Assert-Check {
  param(
    [bool]$Condition,
    [string]$Test,
    [string]$PassDetail,
    [string]$FailDetail
  )

  if ($Condition) {
    Add-Result -Test $Test -Status "PASS" -Detail $PassDetail
  } else {
    Add-Result -Test $Test -Status "FAIL" -Detail $FailDetail
  }
}

function Invoke-WithRetry {
  param(
    [scriptblock]$Action,
    [string]$Label,
    [int]$MaxAttempts = 4,
    [int]$DelaySeconds = 8
  )

  $lastError = $null

  for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
    try {
      return & $Action
    }
    catch {
      $lastError = $_
      if ($attempt -lt $MaxAttempts) {
        Write-Host "$Label failed on attempt $attempt/$MaxAttempts. Retrying in $DelaySeconds sec..." -ForegroundColor Yellow
        Start-Sleep -Seconds $DelaySeconds
      }
    }
  }

  throw $lastError
}

function Invoke-JsonPost {
  param(
    [string]$Url,
    [hashtable]$Body
  )

  $json = $Body | ConvertTo-Json -Depth 10

  return Invoke-WithRetry -Label "POST $Url" -Action {
    $resp = Invoke-WebRequest $Url -Method Post -Headers $Headers -Body $json -TimeoutSec 90
    $obj = $resp.Content | ConvertFrom-Json
    [pscustomobject]@{
      StatusCode = $resp.StatusCode
      Json = $obj
      Raw = $resp.Content
    }
  }
}

function Test-BriefStructure {
  param(
    [string]$Reply,
    [string]$NodePrefix
  )

  $needles = @(
    "Brief Title",
    "Primary Signal",
    "Supporting Context",
    "Implications",
    "Confidence",
    "Monitoring Priorities"
  )

  foreach ($n in $needles) {
    Assert-Check `
      -Condition ($Reply -match [regex]::Escape($n)) `
      -Test "$NodePrefix brief has $n" `
      -PassDetail "Found section: $n" `
      -FailDetail "Missing section: $n"
  }
}

Write-Host "== HX2 regression smoke ==" -ForegroundColor Cyan

# 1) brain status
try {
  $brain = Invoke-WithRetry -Label "GET $Base/api/brain/status" -Action { Invoke-WebRequest "$Base/api/brain/status" -TimeoutSec 30 }
  $brainJson = $brain.Content | ConvertFrom-Json

  Assert-Check ($brain.StatusCode -eq 200) "brain/status http" "HTTP 200" "Expected HTTP 200, got $($brain.StatusCode)"
  Assert-Check ($brainJson.ok -eq $true) "brain/status ok" "ok=true" "ok was not true"
}
catch {
  Add-Result -Test "brain/status request" -Status "FAIL" -Detail $_.Exception.Message
}

# 2) X2 baseline
$x2 = $null
try {
  $x2 = Invoke-JsonPost -Url "$Base/api/chat/send" -Body @{
    message     = "What does the latest macro intelligence imply for XRP and broader markets?"
    node_target = "X2"
  }

  Assert-Check ($x2.StatusCode -eq 200) "X2 http" "HTTP 200" "Expected HTTP 200, got $($x2.StatusCode)"
  Assert-Check ($x2.Json.ok -eq $true) "X2 ok" "ok=true" "ok was not true"
  Assert-Check ($x2.Json.node_target -eq "X2") "X2 node target" "node_target=X2" "Expected X2, got $($x2.Json.node_target)"
  Assert-Check ($x2.Json.anchor_source -eq "bloomberg_markets") "X2 anchor" "anchor=bloomberg_markets" "Expected bloomberg_markets, got $($x2.Json.anchor_source)"
  Assert-Check ($x2.Json.catalyst_summary.direct_catalysts.Count -eq 0) "X2 direct catalyst count" "No direct catalysts" "Expected zero direct catalysts"

  $x2Reply = [string]$x2.Json.result.data.reply
  Test-BriefStructure -Reply $x2Reply -NodePrefix "X2"

  Assert-Check (
    ($x2Reply -match "No direct catalyst") -or
    ($x2Reply -match "No direct catalysts") -or
    ($x2Reply -match "no direct.+identified")
  ) "X2 no-direct wording" "Reply communicates no direct catalyst" "Reply did not clearly communicate no direct catalyst"

  Assert-Check (
    $x2Reply -match "Indirect backdrop"
  ) "X2 indirect-backdrop wording" "Reply explicitly labels indirect backdrop" "Reply did not explicitly label indirect backdrop"

  Assert-Check (
    $x2Reply -match "Narrative support"
  ) "X2 narrative-support wording" "Reply explicitly labels narrative support" "Reply did not explicitly label narrative support"

  Assert-Check (
    -not (
      ($x2Reply -match "Direct catalyst") -and
      -not (
        ($x2Reply -match "No direct catalyst") -or
        ($x2Reply -match "No direct catalysts")
      )
    )
  ) "X2 direct-catalyst restraint" "Reply does not invent a direct catalyst" "Reply appears to present a direct catalyst for X2"
}
catch {
  Add-Result -Test "X2 request" -Status "FAIL" -Detail $_.Exception.Message
}

# 3) H2 baseline
$h2 = $null
try {
  $h2 = Invoke-JsonPost -Url "$Base/api/chat/send" -Body @{
    message     = "What are the biggest geopolitical signals in the latest intelligence?"
    node_target = "H2"
  }

  Assert-Check ($h2.StatusCode -eq 200) "H2 http" "HTTP 200" "Expected HTTP 200, got $($h2.StatusCode)"
  Assert-Check ($h2.Json.ok -eq $true) "H2 ok" "ok=true" "ok was not true"
  Assert-Check ($h2.Json.node_target -eq "H2") "H2 node target" "node_target=H2" "Expected H2, got $($h2.Json.node_target)"
  Assert-Check ($h2.Json.anchor_source -eq "bbc_world") "H2 anchor" "anchor=bbc_world" "Expected bbc_world, got $($h2.Json.anchor_source)"
  Assert-Check ($h2.Json.catalyst_summary.direct_catalysts.Count -ge 1) "H2 direct catalyst count" "At least one direct catalyst" "Expected at least one direct catalyst"

  $directJson = $h2.Json.catalyst_summary.direct_catalysts | ConvertTo-Json -Depth 5
  Assert-Check ($directJson -match "bbc_world") "H2 direct catalyst source" "bbc_world present in direct catalysts" "bbc_world missing from direct catalysts"

  $h2Reply = [string]$h2.Json.result.data.reply
  Test-BriefStructure -Reply $h2Reply -NodePrefix "H2"
  Assert-Check ($h2Reply -match "Direct catalyst") "H2 direct-catalyst wording" "Reply references direct catalyst" "Reply did not reference direct catalyst"

  Assert-Check (
    $h2Reply -match "Narrative support"
  ) "H2 narrative-support wording" "Reply references narrative support" "Reply did not reference narrative support"
}
catch {
  Add-Result -Test "H2 request" -Status "FAIL" -Detail $_.Exception.Message
}

# 4) X2 mixed restraint
$x2Mixed = $null
try {
  $x2Mixed = Invoke-JsonPost -Url "$Base/api/chat/send" -Body @{
    message     = "Does the latest intelligence suggest a real risk-off move for XRP because of Iran and Taiwan tensions, or is this still mostly background noise?"
    node_target = "X2"
  }

  Assert-Check ($x2Mixed.StatusCode -eq 200) "X2 mixed http" "HTTP 200" "Expected HTTP 200, got $($x2Mixed.StatusCode)"
  Assert-Check ($x2Mixed.Json.anchor_source -eq "bloomberg_markets") "X2 mixed anchor" "anchor=bloomberg_markets" "Expected bloomberg_markets, got $($x2Mixed.Json.anchor_source)"
  Assert-Check ($x2Mixed.Json.catalyst_summary.direct_catalysts.Count -eq 0) "X2 mixed direct catalyst count" "No direct catalysts" "Expected zero direct catalysts"

  $x2MixedReply = [string]$x2Mixed.Json.result.data.reply
  Test-BriefStructure -Reply $x2MixedReply -NodePrefix "X2 mixed"
}
catch {
  Add-Result -Test "X2 mixed request" -Status "FAIL" -Detail $_.Exception.Message
}

# 5) H2 cross-theater restraint
$h2Cross = $null
try {
  $h2Cross = Invoke-JsonPost -Url "$Base/api/chat/send" -Body @{
    message     = "Do the latest intelligence signals suggest these Iran and Taiwan developments are connected as part of a broader escalation pattern, or should they still be treated as separate theaters?"
    node_target = "H2"
  }

  Assert-Check ($h2Cross.StatusCode -eq 200) "H2 cross http" "HTTP 200" "Expected HTTP 200, got $($h2Cross.StatusCode)"
  Assert-Check ($h2Cross.Json.anchor_source -eq "bbc_world") "H2 cross anchor" "anchor=bbc_world" "Expected bbc_world, got $($h2Cross.Json.anchor_source)"
  Assert-Check ($h2Cross.Json.catalyst_summary.direct_catalysts.Count -ge 1) "H2 cross direct catalyst count" "At least one direct catalyst" "Expected at least one direct catalyst"

  $h2CrossReply = [string]$h2Cross.Json.result.data.reply
  Test-BriefStructure -Reply $h2CrossReply -NodePrefix "H2 cross"

  $hasCrossRestraint = (
    ($h2CrossReply -match "separate") -or
    ($h2CrossReply -match "distinct") -or
    ($h2CrossReply -match "independent") -or
    ($h2CrossReply -match "no direct evidence") -or
    ($h2CrossReply -match "no confirmed") -or
    ($h2CrossReply -match "not necessarily connected") -or
    ($h2CrossReply -match "no clear linkage") -or
    ($h2CrossReply -match "treated individually") -or
    ($h2CrossReply -match "different drivers") -or
    ($h2CrossReply -match "not linked") -or
    ($h2CrossReply -match "no indication they are connected")
  )

  Assert-Check $hasCrossRestraint "H2 cross restraint wording" "Reply preserves separation/restraint" "Reply did not clearly preserve separation/restraint"
  Assert-Check (
    $h2CrossReply -match "Direct catalyst"
  ) "H2 cross direct-catalyst wording" "Reply preserves direct-catalyst framing" "Reply lost direct-catalyst framing in cross-theater test"

  Assert-Check (
    $h2CrossReply -match "Narrative support"
  ) "H2 cross narrative-support wording" "Reply preserves narrative-support framing" "Reply lost narrative-support framing in cross-theater test"
}
catch {
  Add-Result -Test "H2 cross request" -Status "FAIL" -Detail $_.Exception.Message
}

Write-Host ""
Write-Host "== HX2 regression summary ==" -ForegroundColor Cyan
$results | Format-Table -AutoSize

$fails = @($results | Where-Object { $_.status -eq "FAIL" })

Write-Host ""
if ($fails.Count -gt 0) {
  Write-Host "HX2 REGRESSION FAILED ($($fails.Count) failing checks)" -ForegroundColor Red
  exit 1
} else {
  Write-Host "ALL HX2 REGRESSION TESTS PASSED" -ForegroundColor Green
  exit 0
}



