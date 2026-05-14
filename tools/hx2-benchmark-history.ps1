$ErrorActionPreference = "Stop"

powershell -ExecutionPolicy Bypass -File ".\tools\hx2-benchmark-guard.ps1"

$src = ".\tools\hx2-last-benchmark.json"
$dir = ".\tools\benchmark-history"

if (!(Test-Path $dir)) {
  New-Item -ItemType Directory -Path $dir | Out-Null
}

if (!(Test-Path $src)) {
  throw "Missing benchmark file: $src"
}

$stamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$dest = Join-Path $dir "benchmark_$stamp.json"

Copy-Item $src $dest -Force

Write-Host "Saved benchmark snapshot:"
Write-Host $dest
