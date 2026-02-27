# DEV2 — BuildOps STB Front Door

## Goal
Never patch blind. Always:
1) Verify tooling
2) Smoke test
3) If fail: capture autopsy bundle
4) Only then isolate failure class and apply *minimum* patch

## Common commands
### Default STB routine (recommended)
.\tools\dev2.ps1 -Mode stb -Base https://optinodeiq.com -ApiKey $env:HX2_API_KEY -Vps $env:HX2_VPS

### Smoke only
.\tools\dev2.ps1 -Mode smoke -Base https://optinodeiq.com -ApiKey $env:HX2_API_KEY -Vps $env:HX2_VPS

### Autopsy bundle (run first when anything is weird)
.\tools\dev2.ps1 -Mode autopsy -Vps $env:HX2_VPS

### Enqueue + poll (manual)
$taskId = (.\tools\dev2.ps1 -Mode enqueue -Base https://optinodeiq.com -ApiKey $env:HX2_API_KEY -Task ping).taskId
.\tools\dev2.ps1 -Mode poll -Base https://optinodeiq.com -ApiKey $env:HX2_API_KEY -TaskId $taskId -PollSeconds 90
