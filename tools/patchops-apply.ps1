param(
  [Parameter(Mandatory=$true)][string]$Path,
  [Parameter(Mandatory=$true)][string]$Content,
  [ValidateSet("fast","full")][string]$Mode = "fast"
)

function Fail($m){ throw $m }

if (-not (Test-Path -LiteralPath $Path)) { Fail "File not found: $Path" }

# ---- 1) Write to temp (atomic workflow) ----
$dir = Split-Path -Parent $Path
$tmp = Join-Path $dir (".__patchops_tmp__" + [Guid]::NewGuid().ToString("N") + (Split-Path -Leaf $Path))
$bak = $Path + ".bak." + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

Set-Content -LiteralPath $tmp -Value $Content -Encoding UTF8 -NoNewline

# ---- 2) Validate (cheap first) ----
$ext = ([IO.Path]::GetExtension($Path) ?? "").ToLowerInvariant()

if ($ext -eq ".ps1") {
  $tokens = $null; $errors = $null
  [System.Management.Automation.Language.Parser]::ParseFile((Resolve-Path -LiteralPath $tmp).Path,[ref]$tokens,[ref]$errors) | Out-Null
  if ($errors -and $errors.Count) {
    Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
    $errors | Format-List | Out-String | Fail
  }
}

# TS/JS quick sanity: if typescript exists, run typecheck (fast) or build (full)
# NOTE: "fast" is designed to catch 90% of breakage without a full build.
if ($ext -in @(".ts",".tsx",".js",".jsx")) {
  if ($Mode -eq "fast") {
    if (Test-Path -LiteralPath ".\node_modules\.bin\tsc.cmd") {
      & .\node_modules\.bin\tsc.cmd --noEmit | Out-Host
      if ($LASTEXITCODE -ne 0) {
        Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
        Fail "Typecheck failed (tsc --noEmit). Temp file not applied."
      }
    } else {
      Write-Host "WARN: tsc not found. Running: npm run lint" -ForegroundColor Yellow
      npm run lint | Out-Host
      if ($LASTEXITCODE -ne 0) {
        Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
        Fail "Lint failed. Temp file not applied."
      }
    }
  } else {
    npm run build | Out-Host
    if ($LASTEXITCODE -ne 0) {
      Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
      Fail "Build failed. Temp file not applied."
    }
  }
}

# ---- 3) Backup + replace atomically ----
Copy-Item -LiteralPath $Path -Destination $bak -Force
Move-Item -LiteralPath $tmp -Destination $Path -Force

Write-Host "PATCHOPS OK: applied => $Path" -ForegroundColor Green
Write-Host "Backup => $bak" -ForegroundColor DarkGray