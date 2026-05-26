param(
  [string]$BaseUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"

Write-Host "`n== ORCHESTRATION COMPILER API PROBE =="

$Url = "$BaseUrl/api/hx2/orchestration-compiler"

try {
  $Response = Invoke-RestMethod -Uri $Url -Method GET
} catch {
  throw "Compiler API probe failed at $Url. Make sure dev server is running. $($_.Exception.Message)"
}

$RequiredFields = @(
  "ok",
  "route",
  "compiler_id",
  "compiler_phase",
  "compiler_mode",
  "composition_mutation_allowed",
  "stage_count",
  "ordered_stages",
  "registry_integrity",
  "registry_validation",
  "lineage_integrity",
  "dependency_validation",
  "readiness"
)

foreach ($Field in $RequiredFields) {
  if (-not ($Response.PSObject.Properties.Name -contains $Field)) {
    throw "Compiler API response missing field: $Field"
  }
}

if ($Response.route -ne "/api/hx2/orchestration-compiler") {
  throw "Compiler API returned wrong route marker: $($Response.route)"
}

if ($Response.composition_mutation_allowed -ne $false) {
  throw "Compiler API must report composition_mutation_allowed=false"
}

if ($Response.compiler_mode -ne "read_only_preview") {
  throw "Compiler API must remain read_only_preview"
}

if (-not ($Response.readiness.PSObject.Properties.Name -contains "compiler_ready")) {
  throw "Compiler readiness missing compiler_ready"
}

if (-not ($Response.readiness.PSObject.Properties.Name -contains "blocking_reasons")) {
  throw "Compiler readiness missing blocking_reasons"
}

Write-Host "ORCHESTRATION COMPILER API PROBE PASSED"
$Response | ConvertTo-Json -Depth 12
