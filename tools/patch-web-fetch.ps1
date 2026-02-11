$File = "app/api/chat/send/route.ts"
$src  = Get-Content $File -Raw

# Match your actual line:
$needleRe = [regex]::Escape("const body = await req.json().catch(() => ({} as any));")
if ($src -notmatch $needleRe) {
  throw "Anchor not found: no body json parse line in $File"
}

$insert = @"
const wantWeb =
  process.env.HX2_WEB_ENABLED === "true" &&
  /today|latest|current|now|who won|score|price|news|headline|breaking/i.test(String(msg || body?.message || ""));

"@

$src = [regex]::Replace($src, $needleRe, ("const body = await req.json().catch(() => ({} as any));" + "`n" + $insert), 1)

Set-Content -Encoding UTF8 -NoNewline -Path $File -Value $src
Write-Host "Patched web-fetch logic into $File"