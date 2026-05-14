$ErrorActionPreference = "Stop"

$Base = "https://optinodeiq.com/api/hx2/chat-master"

$tests = @(
  @{ name="General";   q="Why is the sky blue?" },
  @{ name="Knowledge"; q="What is AGE garlic?" },
  @{ name="Health";    q="Is creatine safe daily?" },
  @{ name="HealthRouter"; q="Does AGE garlic have side effects?" },
  @{ name="Business";  q="How can I get more leads at a trade show?" },
  @{ name="Parenting"; q="My 8 year old hates reading homework. What should I do?" },
  @{ name="Builder";   q="Why did deploy fail?" },
  @{ name="Research";  q="Latest XRP news today" }
)

$results = @()

foreach ($t in $tests) {
  $body = @{
    user_query = $t.q
  } | ConvertTo-Json -Depth 10

  try {
    $r = Invoke-RestMethod `
      -Uri $Base `
      -Method POST `
      -ContentType "application/json" `
      -Body $body

    $answer = [string]$r.answer
    $score = 7

    if ($answer.Length -ge 300) { $score += 1 }
    if ($answer.Length -ge 700) { $score += 1 }

    if ($answer -match "Incomplete input detail") { $score -= 4 }
    if ($answer -match "Baseline fallback") { $score -= 5 }
    if ($answer -match "No specific actions returned") { $score -= 3 }
    if ($answer -match "OPENAI_API_KEY missing") { $score -= 5 }

    if ($t.name -eq "General" -and $answer -match "Rayleigh|scattering|atmosphere|wavelength") { $score += 2 }
    if ($t.name -eq "Knowledge") {
      if ($answer -match "Aged Garlic Extract|AGE|garlic") { $score += 2 }
      if ($answer -match "S-allyl|SAC|Kyolic|odorless|aged") { $score += 1 }
    }
    if ($t.name -eq "Health") {
      if ($answer -match "daily|kidney|hydration|creatine") { $score += 2 }
      if ($answer -match "3.?5|grams|dose|water|BUN|creatinine|healthy adults|generally safe|maintenance") { $score += 1 }
    }
    if ($t.name -eq "HealthRouter" -and $answer -match "side effects|blood.thin|bleeding|stomach|bloating|garlic") { $score += 2 }
    if ($t.name -eq "Business" -and $answer -match "lead|follow-up|offer|CTA|conversion|booth|trade show") { $score += 2 }
    if ($t.name -eq "Parenting") {
      if ($answer -match "PA2 Quick Read") { $score += 1 }
      if ($answer -match "Root Cause Possibilities") { $score += 1 }
      if ($answer -match "Confidence Protection") { $score += 1 }
      if ($answer -match "Daily Structure") { $score += 1 }
      if ($answer -match "Five Moves Ahead") { $score += 1 }
      if ($answer -match "Parent Mistakes To Avoid") { $score += 1 }
      if ($answer -match "Next Best Action") { $score += 1 }
      if ($answer -match "reading|confidence|routine|homework|decoding|comprehension") { $score += 1 }
    }
    if ($t.name -eq "Builder") {
      if ($answer -match "root cause|failure|PowerShell|git|deploy|validation|rollback|build|logs|diagnostic|smoke|preflight|minimal patch|verify|verification|npm run build|git status") { $score += 2 }
      if ($answer -match "deploy|failed|fix|check|error|route|compile|TypeScript|Vercel|safe") { $score += 1 }
    }
    if ($t.name -eq "Research" -and $answer -match "Quick Read|Key Developments|What Matters|Source Highlights|XRP") { $score += 2 }
    if ($t.name -eq "Research" -and $answer -match "HX2 detected this as a research") { $score -= 5 }

    if ($score -gt 10) { $score = 10 }
    if ($score -lt 0) { $score = 0 }

    $results += [pscustomobject]@{
      Test   = $t.name
      Query  = $t.q
      Score  = $score
      Passed = ($score -ge 7)
    }
  }
  catch {
    $results += [pscustomobject]@{
      Test   = $t.name
      Query  = $t.q
      Score  = 0
      Passed = $false
    }
  }
}

$avg = [Math]::Round((($results | Measure-Object -Property Score -Average).Average), 2)
$passedCount = @($results | Where-Object { $_.Passed -eq $true }).Count
$totalCount = @($results).Count

$summary = [pscustomobject]@{
  AverageScore  = $avg
  Passed        = "$passedCount/$totalCount"
  OverallPassed = ($avg -ge 7 -and $passedCount -eq $totalCount)
}

$results | Format-Table -AutoSize
Write-Host ""
$summary | Format-List

$out = [pscustomobject]@{
  results = $results
  summary = $summary
  generated_utc = (Get-Date).ToUniversalTime().ToString("s") + "Z"
}

$out | ConvertTo-Json -Depth 20 | Set-Content ".\tools\hx2-last-benchmark.json" -Encoding UTF8









