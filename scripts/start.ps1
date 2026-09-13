$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot)
python scripts/bootstrap.py
if ($LASTEXITCODE -ne 0) { throw 'Bootstrap failed' }
docker compose -f compose.yml -f compose.local.yml up -d --build
if ($LASTEXITCODE -ne 0) { throw 'Startup failed' }
Write-Output 'Open https://localhost:8443. Credentials are in .secrets/admin-login.txt.'
