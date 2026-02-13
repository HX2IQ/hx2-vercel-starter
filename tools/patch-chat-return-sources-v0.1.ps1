param()

$ErrorActionPreference = "Stop"

# Repo root from this script location
$RepoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $RepoRoot

$FileRel  = "app/api/chat/send/route.ts"
$FilePath = Join-Path $RepoRoot $FileRel

if (!(Test-Path -LiteralPath $FilePath)) { throw "Missing target file: $FileRel" }

$src = Get-Content -Raw -LiteralPath $FilePath

# ---- 0) Ensure we have a webHits var somewhere (your earlier patch created it) ----
# If your file uses a different name, we still patch sources based on what exists.
$hasWebHits = ($src -match '\bwebHits\b')

# ---- 1) Ensure sourcesFromWeb helper exists (idempotent) ----
if ($src -notmatch '\bconst\s+sourcesFromWeb\b') {

  # We inject near the top of POST handler by looking for first "try {" inside POST()
  $postMatch = [regex]::Match($src, 'export\s+async\s+function\s+POST\s*\([\s\S]*?\)\s*\{')
  if (-not $postMatch.Success) { throw "Anchor not found: export async function POST(...){ }" }

  # Find a reasonable insertion point shortly after POST starts
  $insertPos = $postMatch.Index + $postMatch.Length

  $block = @"
  
  // HX2_SOURCES_FROM_WEB v0.1
  const sourcesFromWeb = (typeof webHits !== "undefined" && Array.isArray(webHits))
    ? webHits
        .map((h: any) => ({
          title: String(h?.title || "").trim(),
          url: String(h?.url || "").trim(),
          ts: h?.ts ? String(h.ts) : undefined,
          source: h?.source ? String(h.source) : "web",
        }))
        .filter((s: any) => s.url)
    : [];
  // /HX2_SOURCES_FROM_WEB v0.1

"@

  $src = $src.Insert($insertPos, $block)
}

# ---- 2) Force NextResponse.json success payload to include sources: sourcesFromWeb ----
# Strategy:
#   - If 'sources:' exists in the main response object, replace first occurrence value.
#   - Else inject 'sources: sourcesFromWeb,' right after the first NextResponse.json({ anchor.
if ($src -match 'NextResponse\.json\(\s*\{') {

  if ($src -match 'sources\s*:') {
    $src = [regex]::Replace($src, 'sources\s*:\s*[^,\n}]+', 'sources: sourcesFromWeb', 1)
  }
  elseif ($src -match '\bsources\s*,') {
    $src = [regex]::Replace($src, '\bsources\s*,', 'sources: sourcesFromWeb,', 1)
  }
  else {
    $nr = [regex]::Match($src, 'NextResponse\.json\(\s*\{')
    if (-not $nr.Success) { throw "Could not find NextResponse.json({ anchor" }
    $pos = $nr.Index + $nr.Length
    $src = $src.Insert($pos, "`n      sources: sourcesFromWeb,")
  }

} else {
  throw "Anchor not found: NextResponse.json({"
}

# ---- 3) Write back UTF-8 no BOM ----
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($FilePath, $src, $utf8)

Write-Host "OK: Patched $FileRel (return sourcesFromWeb)" -ForegroundColor Green