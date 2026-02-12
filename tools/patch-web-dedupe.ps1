$File = "app/api/chat/send/route.ts"
$src  = Get-Content $File -Raw

# 1) Remove the old early web env+wantWeb block (the one near the top before BRIDGE_MEMORY_APPEND)
$src = [regex]::Replace(
  $src,
  '(?ms)^\s*const\s+HX2_WEB_ENABLED\s*=\s*String\(process\.env\.HX2_WEB_ENABLED[\s\S]*?;\s*\r?\n\s*const\s+wantWeb\s*=\s*[\s\S]*?;\s*\r?\n',
  "`n",
  1
)

# 2) Remove the old later web flags block that re-defines explicitUrls and uses wantsWeb(message) as a function
# (this is the block shown in your error around lines 124-131)
$src = [regex]::Replace(
  $src,
  '(?ms)^\s*const\s+use_web\s*=\s*Boolean\(body\?\.\s*use_web\);\s*\r?\n\s*const\s+auto_web\s*=\s*wantsWeb\([^\)]*\);\s*\r?\n\s*const\s+want_web\s*=\s*use_web\s*\|\|\s*auto_web;\s*\r?\n\s*//\s*Optional\s+explicit\s+urls\s+passed\s+in\s*\r?\n\s*const\s+explicitUrls\s*:\s*string\[\]\s*=\s*Array\.isArray\(body\?\.\s*web_urls\)[\s\S]*?;\s*\r?\n',
  "`n",
  1
)

# 3) Replace ANY existing "WEB FLAGS (v0.1)" block with a clean one (single source of truth)
$webBlockRe = '(?ms)^\s*//\s*---\s*WEB FLAGS\s*\(v0\.1\)\s*---[\s\S]*?//\s*---\s*/WEB FLAGS\s*---\s*\r?\n'
if ($src -notmatch $webBlockRe) {
  throw "Expected WEB FLAGS (v0.1) block not found. Search for 'WEB FLAGS (v0.1)' in $File."
}

$cleanBlock = @"
    // --- WEB FLAGS (v0.2) ---
    const HX2_WEB_ENABLED = String(process.env.HX2_WEB_ENABLED || "").toLowerCase() === "true";

    // URLs typed in message
    const msgUrls: string[] = (message.match(/https?:\/\/\S+/g) || []).map((u) => String(u));

    // URLs explicitly passed by caller (optional)
    const bodyUrls: string[] = Array.isArray((body as any)?.web_urls)
      ? (body as any).web_urls.map((u: any) => String(u))
      : [];

    const explicitUrls: string[] = Array.from(new Set([...msgUrls, ...bodyUrls]));

    const wantsWeb =
      HX2_WEB_ENABLED &&
      /(\buse web\b|\btoday\b|\blatest\b|\bcurrent\b|\bnow\b|\bwho won\b|\bscore\b|\bprice\b|\bnews\b|\bheadline\b|\bbreaking\b|\bupdate\b)/i
        .test(message);

    const useWeb = wantsWeb || (explicitUrls.length > 0);
    // --- /WEB FLAGS ---
"@

$src = [regex]::Replace($src, $webBlockRe, $cleanBlock, 1)

# 4) Ensure the SUCCESS response always returns these keys (replace first web:{...} in success response)
$successWebRe = '(?ms)web\s*:\s*\{[\s\S]*?\}\s*,'
if ($src -notmatch $successWebRe) {
  throw "Could not find a web:{...} object to normalize in $File"
}
$src = [regex]::Replace(
  $src,
  $successWebRe,
  'web: { want_web: wantsWeb, use_web: useWeb, auto_web: false, explicit_urls: explicitUrls.length },',
  1
)

# 5) Ensure ERROR responses also reference wantsWeb/useWeb (not wantWeb/want_web variables)
$src = $src -replace 'wantWeb\b', 'wantsWeb'
$src = $src -replace 'use_web\b', 'useWeb'
$src = $src -replace 'want_web\b', 'wantsWeb'  # conservative; avoids undefined refs

Set-Content -Encoding UTF8 -NoNewline -Path $File -Value $src
Write-Host "OK: cleaned duplicate web flags + normalized return web keys in $File"