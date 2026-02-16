param()

$ErrorActionPreference="Stop"

$FileRel  = "app/api/chat/send/route.ts"
$FilePath = Join-Path (Get-Location).Path $FileRel
if (!(Test-Path -LiteralPath $FilePath)) { throw "Missing file: $FilePath" }

$src = Get-Content -LiteralPath $FilePath -Raw

$tag = "HX2_FIX_SOURCES_IN_RESPONSEINIT v0.1"
if ($src -match [regex]::Escape($tag)) {
  Write-Host "SKIP: $tag already applied" -ForegroundColor Yellow
  exit 0
}

# Remove a standalone "sources," line ONLY when it appears in the ResponseInit (2nd arg)
# We target the common pattern: headers block then a stray sources line before the ResponseInit closes
$pattern = '(headers\s*:\s*\{[\s\S]*?\}\s*,\s*)\n(\s*)sources\s*,\s*\n'
if ($src -notmatch $pattern) {
  # fallback: remove any "sources," line that appears within the second arg object by
  # locating "NextResponse.json(" with two args and scrubbing inside that 2nd arg only.
  $m = [regex]::Match($src, 'NextResponse\.json\(\s*\{[\s\S]*?\}\s*,\s*\{[\s\S]*?\}\s*\)')
  if (-not $m.Success) { throw "Could not locate NextResponse.json({...}, {...}) block to patch." }

  $block = $m.Value
  $block2 = [regex]::Replace($block, "(\n\s*)sources\s*,\s*(\n)", '$1$2', [System.Text.RegularExpressions.RegexOptions]::None)

  if ($block2 -eq $block) { throw "No ResponseInit 'sources,' line found to remove." }

  $src = $src.Substring(0, $m.Index) + $block2 + $src.Substring($m.Index + $m.Length)
} else {
  $src = [regex]::Replace($src, $pattern, '$1' + "`n", 1)
}

# Stamp tag
$src = "/* $tag */`n" + $src

$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($FilePath, $src, $utf8)

Write-Host "OK: patched $FileRel ($tag)" -ForegroundColor Green