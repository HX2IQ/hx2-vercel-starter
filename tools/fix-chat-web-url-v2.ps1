param(
  [string]$FileRel = "app/api/chat/send/route.ts"
)

$RepoRoot = (Get-Location).Path
$File = Join-Path $RepoRoot $FileRel
if (!(Test-Path $File)) { throw "Missing file: $File (run from repo root hx2-vercel-starter)" }

$src = Get-Content $File -Raw

# 1) Ensure helper exists exactly once (insert using IndexOf, not regex)
$helperLine = 'const __HX2_WEB_SEARCH_URL = new URL("/api/web/search", req.url).toString();'
if ($src -notlike "*__HX2_WEB_SEARCH_URL*") {
  $needle = "const body = await req.json().catch"
  $pos = $src.IndexOf($needle)
  if ($pos -lt 0) { throw "Anchor not found: $needle" }

  # insert helper on the NEXT line after the anchor line
  $lineEnd = $src.IndexOf("`n", $pos)
  if ($lineEnd -lt 0) { $lineEnd = $src.Length }
  $src = $src.Insert($lineEnd + 1, $helperLine + "`n")
}

# 2) Replace the known bad pattern that collapses to relative when BASE is empty
#    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/web/search`, ...)
$src = $src.Replace(
  'fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/web/search`',
  'fetch(__HX2_WEB_SEARCH_URL'
)

# 3) Replace any fetch("/api/web/search") variants with helper (regex WITH TIMEOUT)
$timeout = [TimeSpan]::FromMilliseconds(200)
$reFetch = [regex]::new('fetch\(\s*([`"'+ "'" + '])\/api\/web\/search', `
  [System.Text.RegularExpressions.RegexOptions]::IgnoreCase, $timeout)
$src = $reFetch.Replace($src, 'fetch(__HX2_WEB_SEARCH_URL')

# 4) Replace new URL("/api/web/search") without base
$reURL = [regex]::new('new URL\(\s*([`"'+ "'" + '])\/api\/web\/search\1\s*\)', `
  [System.Text.RegularExpressions.RegexOptions]::IgnoreCase, $timeout)
$src = $reURL.Replace($src, 'new URL("/api/web/search", req.url)')

# 5) Write back (UTF8 no BOM)
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($File, $src, $utf8)

Write-Host "OK: Patched $FileRel"

Write-Host "`nRemaining raw '/api/web/search' references (should be ONLY the helper line, or 0):"
Select-String -Path $File -Pattern "/api/web/search" | ForEach-Object { "{0}: {1}" -f $_.LineNumber, $_.Line } | Out-Host