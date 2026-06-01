$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 NEW CHAT HANDOFF =="

npm run dev2:continuity
npm run dev2:recovery

$OutFile = "HX2_NEW_CHAT_HANDOFF.md"

$Bootstrap = if (Test-Path "HX2_CHAT_BOOTSTRAP.md") {
  Get-Content "HX2_CHAT_BOOTSTRAP.md" -Raw
} else {
  "Missing HX2_CHAT_BOOTSTRAP.md"
}

$Recovery = if (Test-Path "HX2_CHAT_RECOVERY_PROMPT.md") {
  Get-Content "HX2_CHAT_RECOVERY_PROMPT.md" -Raw
} else {
  "Missing HX2_CHAT_RECOVERY_PROMPT.md"
}

$Text = @"
# HX2 NEW CHAT HANDOFF

Paste this into a new chat before continuing HX2 build work.

---

$Bootstrap

---

$Recovery

---

## Required startup instruction for new chat

Operate under DEV2/QIDC continuity mode.

Before providing any sprint:
1. Confirm repo continuity from this handoff.
2. Preserve DEV2 Structured Mutation Mode.
3. Do not assume old deployment failures are still active.
4. Run or request:
   npm run dev2:continuity
5. Continue from current HEAD and current Phase 3B stabilization state.
"@

Set-Content $OutFile $Text -Encoding UTF8

Write-Host ""
Write-Host "New chat handoff written:"
Write-Host $OutFile
