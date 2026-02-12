$File = "app/api/chat/send/route.ts"
$src  = Get-Content $File -Raw

# Anchor: we already compute `message` in the route
$anchor = 'const message = String(msg || "").trim();'
if ($src -notmatch [regex]::Escape($anchor)) { throw "Anchor not found: $anchor" }

# Insert web flags exactly once, right after `const message = ...`
$insert = @"
$anchor

    // --- WEB FLAGS (v0.1) ---
    const HX2_WEB_ENABLED = String(process.env.HX2_WEB_ENABLED || "").toLowerCase() === "true";
    const explicitUrls = (message.match(/https?:\/\/\S+/g) || []);
    const wantsWeb =
      HX2_WEB_ENABLED &&
      /(\buse web\b|\btoday\b|\blatest\b|\bcurrent\b|\bnow\b|\bwho won\b|\bscore\b|\bprice\b|\bnews\b|\bheadline\b|\bbreaking\b|\bupdate\b)/i
        .test(message);
    const useWeb = wantsWeb || (explicitUrls.length > 0);
    // --- /WEB FLAGS ---
"@

# Replace the single anchor occurrence with the inserted block
$src = [regex]::Replace($src, [regex]::Escape($anchor), [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $insert }, 1)

# Now force-return web keys (replace the first `web: { ... }` block inside the success response)
# This avoids any undefined variables that get dropped by JSON.
$webBlockRe = 'web\s*:\s*\{[\s\S]*?\}'
if ($src -notmatch $webBlockRe) { throw "Could not find a web:{...} block to replace" }

$src = [regex]::Replace($src, $webBlockRe, 'web: { want_web: wantsWeb, use_web: useWeb, auto_web: false, explicit_urls: explicitUrls.length }', 1)

Set-Content -Encoding UTF8 -NoNewline -Path $File -Value $src
Write-Host "Patched web flags + web return block in $File"