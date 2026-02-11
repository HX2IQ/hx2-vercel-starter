$ErrorActionPreference = "Stop"

$tsx = "app\chat\ChatClient.tsx"
$css = "app\chat\chat.css"

if (!(Test-Path $tsx)) { throw "Missing $tsx" }
if (!(Test-Path $css)) { throw "Missing $css" }

$src = Get-Content -Raw -Path $tsx

# --- Remove CSS querystring (Next.js ignores it, causes mobile weirdness)
$src = $src -replace 'import\s+"\./chat\.css\?v=\d+"\s*;', 'import "./chat.css";'

# --- Ensure autoGrow helper exists
if ($src -notmatch 'function\s+autoGrow\s*\(') {

$insert = @"
function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "0px";
  const max = 160;
  const next = Math.min(el.scrollHeight, max);
  el.style.height = next + "px";
}
"@

  $src = $src -replace '(function\s+uid\(\)\s*\{\s*[\s\S]*?\}\s*)', "`$1`r`n`r`n$insert`r`n"
}

# --- Replace header with premium branding (hard-left, visible)
$pattern = '<header className="hx2-topbar">[\s\S]*?<\/header>'
$replacement = @"
<header className="hx2-topbar">
  <div className="hx2-brand">
    <div className="hx2-brandname">Opti</div>
    <div className="hx2-tagline">Optimized Intelligence</div>
  </div>

  <div className="hx2-top-actions">
    <button className="hx2-iconbtn" type="button" onClick={() => setDebugOpen(v => !v)}>
      Debug
    </button>
    <button className="hx2-iconbtn" type="button"
      onClick={() => setMessages([{ id: uid(), role: "assistant", content: "New chat started. What’s the goal?" }])}>
      New
    </button>
  </div>
</header>
"@

if ($src -match $pattern) {
  $src = [regex]::Replace($src, $pattern, $replacement, "Singleline")
}

Set-Content -Encoding UTF8 -NoNewline -Path $tsx -Value $src
Write-Host "Patched $tsx"

# --- CSS overrides (premium header + kill empty bubbles)
$cssSrc = Get-Content -Raw -Path $css

$cssAppend = @"
.hx2-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: #fff;
  border-bottom: 1px solid rgba(0,0,0,.08);
}

.hx2-brandname {
  font-size: 22px;
  font-weight: 800;
  color: #111;
}

.hx2-tagline {
  font-size: 12px;
  font-weight: 600;
  color: rgba(17,17,17,.6);
}

.hx2-iconbtn {
  border: 1px solid rgba(0,0,0,.1);
  background: rgba(0,0,0,.03);
  color: #111;
  padding: 8px 10px;
  border-radius: 12px;
  font-weight: 700;
}

.hx2-iconbtn:empty {
  display: none !important;
}

.hx2-input {
  resize: none;
  overflow: hidden;
  min-height: 44px;
  max-height: 160px;
}
"@

$cssSrc = $cssSrc.TrimEnd() + "`r`n`r`n" + $cssAppend + "`r`n"
Set-Content -Encoding UTF8 -NoNewline -Path $css -Value $cssSrc
Write-Host "Patched $css"