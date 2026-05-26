param(
  [Parameter(Mandatory = $false)]
  [string]$Base = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

function Step($Text) {
  Write-Host ""
  Write-Host "== $Text ==" -ForegroundColor Cyan
}

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

Step "fetch registry preview"
$preview = Invoke-RestMethod "$Base/api/hx2/registry/preview?ts=$ts"

Step "fetch registry consistency"
$consistency = Invoke-RestMethod "$Base/api/hx2/registry/consistency?ts=$ts"

$detailRows = @()

foreach ($node in $preview.nodes) {
  $nodeId = $node.node_id
  Write-Host "Fetching detail for $nodeId ..."
  $detail = Invoke-RestMethod "$Base/api/hx2/registry/detail?node_id=$nodeId&ts=$ts"

  $consistencyNode = $consistency.nodes | Where-Object { $_.node_id -eq $nodeId } | Select-Object -First 1
  $detailNode = $detail.node

  $detailRows += [pscustomobject]@{
    node_id                = $nodeId
    registry_status        = $node.status
    enabled                = $node.enabled
    dry_run_only           = $node.dry_run_only
    consistency_status     = if ($null -ne $consistencyNode) { $consistencyNode.status_alignment } else { "unknown" }
    route_reachable        = if ($null -ne $detailNode) { $detailNode.route_reachable } else { $null }
    route_probe_status     = if ($null -ne $detailNode) { $detailNode.route_probe_status } else { $null }
    runtime_status         = if ($null -ne $detailNode) { $detailNode.route_probe_result_status } else { "" }
    detail_status          = if ($null -ne $detailNode) { $detailNode.status_alignment } else { "unknown" }
    issues_count           = if ($null -ne $detailNode) { @($detailNode.issues).Count } else { 0 }
    issues                 = if ($null -ne $detailNode -and @($detailNode.issues).Count -gt 0) { ($detailNode.issues -join " | ") } else { "" }
  }
}

Step "fleet summary"
$healthyCount = @($detailRows | Where-Object { $_.detail_status -eq "ok" -and $_.consistency_status -eq "ok" }).Count
$warningCount = @($detailRows).Count - $healthyCount

[pscustomobject]@{
  total_nodes    = @($detailRows).Count
  healthy_nodes  = $healthyCount
  warning_nodes  = $warningCount
} | Format-List

Step "node dashboard"
$detailRows | Sort-Object node_id | Format-Table -AutoSize

Step "done"
Write-Host "Registry dashboard completed." -ForegroundColor Green
