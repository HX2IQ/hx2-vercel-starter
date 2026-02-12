param(
  [string]$FileRel = "app/api/chat/send/route.ts"
)

$RepoRoot = (Get-Location).Path
$File = Join-Path $RepoRoot $FileRel
if (!(Test-Path $File)) { throw "Missing file: $File (run from repo root hx2-vercel-starter)" }

$src = Get-Content $File -Raw

# --- 1) Upgrade webSearch signature to accept reqUrl ---
# From: async function webSearch(q: string, n = 3) ...
# To:   async function webSearch(reqUrl: string, q: string, n = 3) ...
$timeout = [TimeSpan]::FromMilliseconds(200)
$reSig = [regex]::new('async function webSearch\(\s*q:\s*string\s*,\s*n\s*=\s*3\s*\)', `
  [System.Text.RegularExpressions.RegexOptions]::IgnoreCase, $timeout)

if ($reSig.IsMatch($src)) {
  $src = $reSig.Replace($src, 'async function webSearch(reqUrl: string, q: string, n = 3)', 1)
}

# --- 2) Ensure webSearch defines absolute URL locally ---
# Replace: fetch(__HX2_WEB_SEARCH_URL,
# With:    const __HX2_WEB_SEARCH_URL = new URL("/api/web/search", reqUrl).toString();
#          fetch(__HX2_WEB_SEARCH_URL,
if ($src -match 'async function webSearch\(' -and $src -match 'fetch\(__HX2_WEB_SEARCH_URL') {
  # insert const right after function open brace, only if not already there
  if ($src -notmatch 'new URL\(\"\/api\/web\/search\", reqUrl\)') {
    $reOpen = [regex]::new('(async function webSearch\([^\)]*\)\s*:\s*Promise<[^>]*>\s*\{\s*)', `
      [System.Text.RegularExpressions.RegexOptions]::Singleline, $timeout)
    if ($reOpen.IsMatch($src)) {
      $src = $reOpen.Replace($src, '$1' + 'const __HX2_WEB_SEARCH_URL = new URL("/api/web/search", reqUrl).toString();' + "`n", 1)
    }
  }
}

# --- 3) Update call sites: webSearch(q, n) -> webSearch(req.url, q, n)
# Handle: webSearch(something)
$reCall1 = [regex]::new('webSearch\(\s*([a-zA-Z0-9_.$]+)\s*\)', `
  [System.Text.RegularExpressions.RegexOptions]::None, $timeout)
$src = $reCall1.Replace($src, 'webSearch(req.url, $1)', 50)

# Handle: webSearch(something, 3)
$reCall2 = [regex]::new('webSearch\(\s*([a-zA-Z0-9_.$]+)\s*,\s*([0-9]+)\s*\)', `
  [System.Text.RegularExpressions.RegexOptions]::None, $timeout)
$src = $reCall2.Replace($src, 'webSearch(req.url, $1, $2)', 50)

# Write back UTF8 no BOM
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($File, $src, $utf8)

Write-Host "OK: Patched webSearch scope + calls in $FileRel"

Write-Host "`nSanity checks:"
Write-Host "1) Any remaining fetch(__HX2_WEB_SEARCH_URL) ?"
Select-String -Path $File -Pattern 'fetch\(__HX2_WEB_SEARCH_URL' | Out-Host

Write-Host "2) Any remaining webSearch(q: string, n = 3) signature ?"
Select-String -Path $File -Pattern 'webSearch\(q:\s*string' | Out-Host