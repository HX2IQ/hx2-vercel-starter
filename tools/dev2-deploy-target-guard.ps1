Write-Host "`n== DEV2 DEPLOY TARGET GUARD =="

$expectedBranch = "main"
$expectedRemotePattern = "HX2IQ/hx2-vercel-starter"

$branch = git branch --show-current
$remote = git remote get-url origin
$status = git status --short

Write-Host "Branch: $branch"
Write-Host "Remote: $remote"

if ($branch -ne $expectedBranch) {
  throw "STOP: Wrong branch. Expected '$expectedBranch', got '$branch'"
}

if ($remote -notmatch $expectedRemotePattern) {
  throw "STOP: Wrong remote. Expected remote matching '$expectedRemotePattern', got '$remote'"
}

if ($status) {
  Write-Host "`nDirty working tree:"
  $status
  throw "STOP: Working tree is dirty. Commit, stash, or clean before sprint."
}

Write-Host "DEV2 deploy target guard: PASS"
