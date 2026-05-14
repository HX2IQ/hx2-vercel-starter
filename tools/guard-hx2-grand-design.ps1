$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 Grand Design Guard ==" -ForegroundColor Cyan

$ChatRoute = "app\api\hx2\chat\route.ts"
$ChatMaster = "app\api\hx2\chat-master\route.ts"
$MasterSynth = "app\api\hx2\_lib\master-synth.ts"

if (!(Test-Path $ChatRoute)) { throw "Missing chat route: $ChatRoute" }
if (!(Test-Path $ChatMaster)) { throw "Missing chat-master route: $ChatMaster" }
if (!(Test-Path $MasterSynth)) { throw "Missing master synthesis engine: $MasterSynth" }

$chat = Get-Content $ChatRoute -Raw
$master = Get-Content $ChatMaster -Raw

if ($chat -notmatch "/api/hx2/chat-master") {
  throw "FAIL: /api/hx2/chat must call /api/hx2/chat-master."
}

if ($chat -match "/api/hx2/chat-orchestrator") {
  throw "FAIL: /api/hx2/chat still references old chat-orchestrator."
}

if ($chat -match "/api/hx2/execute") {
  throw "FAIL: /api/hx2/chat must not call execute directly."
}

if ($master -notmatch "synthesizeHx2Answer") {
  throw "FAIL: chat-master must use master synthesis."
}

if ($master -notmatch "source-router") {
  throw "FAIL: chat-master must preserve source-router capability."
}


$RouterSmoke = "tools\smoke-hx2-router-v2.ps1"
if (!(Test-Path $RouterSmoke)) {
  throw "Missing Router v2 smoke script: $RouterSmoke"
}
Write-Host "PASS: HX2 chat remains master-orchestrated." -ForegroundColor Green

