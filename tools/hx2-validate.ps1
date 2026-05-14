param(
  [string]$Target = ""
)

if ($Target -eq "") {
  Write-Host "Usage: .\tools\hx2-validate.ps1 package|build|git"
  exit
}

switch ($Target) {

  "package" {
    node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"
  }

  "build" {
    npm run build
  }

  "git" {
    git status --short
  }

  default {
    Write-Host "Unknown target"
  }
}
