$ErrorActionPreference = "Continue"

$Log = "tools\_latest-build-diagnostic.txt"
New-Item -ItemType Directory -Force -Path "tools" | Out-Null

Write-Host ""
Write-Host "== HX2 Build Diagnostic ==" -ForegroundColor Cyan

npm run build 2>&1 | Tee-Object -FilePath $Log
$Code = $LASTEXITCODE

Write-Host ""
Write-Host "== Diagnostic Summary ==" -ForegroundColor Cyan

if ($Code -eq 0) {
  Write-Host "PASS: Build completed successfully." -ForegroundColor Green
  exit 0
}

Write-Host "FAIL: Build failed." -ForegroundColor Red
Write-Host "Log saved to: $Log" -ForegroundColor Yellow

$Text = Get-Content $Log -Raw

$Patterns = @(
  "Failed to compile",
  "Type error:",
  "Module not found:",
  "Syntax Error",
  "Unexpected eof",
  "Unexpected token",
  "Expected .* got",
  "\./app/.*",
  "app\\.*\.ts",
  "app\\.*\.tsx"
)

foreach ($p in $Patterns) {
  $matches = Select-String -Path $Log -Pattern $p -Context 2,4
  if ($matches) {
    Write-Host ""
    Write-Host "Matched: $p" -ForegroundColor Yellow
    $matches | ForEach-Object {
      $_.Context.PreContext
      $_.Line
      $_.Context.PostContext
      ""
    }
  }
}

throw "Build failed. Review diagnostic summary above."
