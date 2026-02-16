param(
  [Parameter(Mandatory=$true)]
  [string]$Path
)

if (-not (Test-Path -LiteralPath $Path)) {
  throw "File not found: $Path"
}

$tokens = $null
$errors = $null

[System.Management.Automation.Language.Parser]::ParseFile(
  (Resolve-Path -LiteralPath $Path).Path,
  [ref]$tokens,
  [ref]$errors
) | Out-Null

if ($errors -and $errors.Count) {
  $errors | Format-List
  exit 1
}

"PARSE OK: $Path"