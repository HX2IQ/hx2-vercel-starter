$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 TSX MUTATION SAFETY GUARD =="

$targets = @(
  "app/owner-console/_components/capability-planner-panel.tsx",
  "app/owner-console/_components/chat-master-panels.tsx",
  "app/owner-console/page.tsx"
)

$violations = @()

foreach ($file in $targets) {
  if (!(Test-Path $file)) {
    continue
  }

  $text = Get-Content $file -Raw

  if ($text -match '^\s*</>\s*$') {
    # valid fragment close is allowed
  }

  if ($text -like '*</div></div></div></div></div>*') {
    $violations += "Suspicious repeated div close pattern in $file"
  }

  if ($text -like '*<></div>*' -or $text -like '*</div></>*') {
    $violations += "Suspicious fragment/div mismatch in $file"
  }
}

if ($violations.Count -gt 0) {
  foreach ($v in $violations) {
    Write-Host "- $v"
  }

  throw "DEV2 TSX mutation safety guard failed"
}

Write-Host "DEV2 TSX MUTATION SAFETY GUARD PASSED"
