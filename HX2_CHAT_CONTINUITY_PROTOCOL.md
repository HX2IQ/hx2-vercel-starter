# HX2 CHAT CONTINUITY PROTOCOL

Before starting a new chat:
Run:

powershell -ExecutionPolicy Bypass -File .\tools\dev2-chat-bootstrap-export.ps1

Then paste HX2_CHAT_BOOTSTRAP.md into the new chat.

New chat must know:
- repo
- branch
- HEAD SHA
- Vercel project
- production domain
- active phase
- live route status
- current blockers
- DEV2 rules
- QIDC rules
- recent deployment lessons

Goal:
HX2 continuity should be system-owned, not dependent on conversational memory.
