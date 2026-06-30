#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Hotel Platform — Infrastructure Setup Script
.DESCRIPTION
    Automates local infrastructure setup: Fly.io app creation, secret injection,
    and validates Neon/Upstash connectivity.
.NOTES
    Run this AFTER creating your Neon and Upstash accounts.
#>

$ErrorActionPreference = "Stop"
$InformationPreference = "Continue"

# ─── Configuration ─────────────────────────────────────────────────────────────
$FLY_APP_NAME = "hotel-platform-api"
$FLY_REGION   = "mia"  # Miami — closest to Colombia/Caribbean
$FLYCTL_PATH  = if (Get-Command flyctl -ErrorAction SilentlyContinue) {
    "flyctl"
} else {
    $possible = @(
        "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Fly-io.flyctl_Microsoft.Winget.Source_8wekyb3d8bbwe\flyctl.exe",
        "$env:USERPROFILE\.fly\bin\flyctl.exe"
    )
    $found = $possible | Where-Object { Test-Path $_ } | Select-Object -First 1
    if (-not $found) { throw "flyctl not found. Install with: winget install Fly-io.flyctl" }
    $found
}

function Write-Step($Title) {
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
}

function Check-Command($Cmd) {
    if (-not (Get-Command $Cmd -ErrorAction SilentlyContinue)) {
        Write-Warning "⚠  $Cmd is not installed. Install it and re-run."
        return $false
    }
    Write-Host "  ✅ $Cmd found" -ForegroundColor Green
    return $true
}

# ─── Step 0: Prerequisites ─────────────────────────────────────────────────────
Write-Step "Step 0: Checking Prerequisites"
$ok = $true
$ok = (Check-Command git) -and $ok
$ok = (Check-Command node) -and $ok
$ok = (Check-Command npm) -and $ok

if (-not $ok) {
    throw "Missing prerequisites. Install missing tools and re-run."
}

# ─── Step 1: Fly.io Auth ───────────────────────────────────────────────────────
Write-Step "Step 1: Fly.io Authentication"
$whoami = & $FLYCTL_PATH auth whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  🔑 Opening browser for Fly.io login..." -ForegroundColor Yellow
    & $FLYCTL_PATH auth login
    $whoami = & $FLYCTL_PATH auth whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Login failed. Run 'flyctl auth login' manually."
    }
}
Write-Host "  ✅ Authenticated as: $whoami" -ForegroundColor Green

# ─── Step 2: Create Fly.io App ─────────────────────────────────────────────────
Write-Step "Step 2: Creating Fly.io App ($FLY_APP_NAME)"
$appCheck = & $FLYCTL_PATH apps list --json 2>&1 | ConvertFrom-Json
$exists = $appCheck | Where-Object { $_.Name -eq $FLY_APP_NAME }
if (-not $exists) {
    & $FLYCTL_PATH apps create "$FLY_APP_NAME" --org personal
    Write-Host "  ✅ App created: $FLY_APP_NAME" -ForegroundColor Green
} else {
    Write-Host "  ✅ App already exists: $FLY_APP_NAME" -ForegroundColor Green
}

# ─── Step 3: Inject Secrets ────────────────────────────────────────────────────
Write-Step "Step 3: Setting Fly.io Secrets"
Write-Host "  ⚠  Enter your secrets (or press Enter to skip each):" -ForegroundColor Yellow

$secrets = @{
    DATABASE_URL  = "Neon DATABASE_URL (postgresql://...@...neon.tech/...)"
    REDIS_URL     = "Upstash REDIS_URL (redis://...@...upstash.io:...)"
    JWT_SECRET    = "JWT secret (64-char hex)"
    RESEND_API_KEY = "Resend API key"
    OPENWA_URL    = "OpenWA URL"
}

$toSet = @()
foreach ($key in $secrets.Keys) {
    $val = Read-Host "  ${key} ($($secrets[$key]))"
    if ($val) {
        $toSet += "${key}=${val}"
    }
}

if ($toSet.Count -gt 0) {
    & $FLYCTL_PATH secrets set --app "$FLY_APP_NAME" $toSet
    Write-Host "  ✅ Secrets set" -ForegroundColor Green
} else {
    Write-Host "  ⚠  No secrets set. Use 'flyctl secrets set KEY=VALUE' later." -ForegroundColor Yellow
}

# ─── Step 4: Deploy ────────────────────────────────────────────────────────────
Write-Step "Step 4: Deploying to Fly.io"
$deploy = Read-Host "  Deploy now? (y/N)"
if ($deploy -eq 'y') {
    & $FLYCTL_PATH deploy --app "$FLY_APP_NAME" --remote-only --strategy rolling
    Write-Host "  ✅ Deploy initiated. Check status: flyctl status --app $FLY_APP_NAME" -ForegroundColor Green

    # Health check
    Start-Sleep -Seconds 15
    try {
        $health = Invoke-WebRequest -Uri "https://${FLY_APP_NAME}.fly.dev/health" -UseBasicParsing -TimeoutSec 10
        if ($health.StatusCode -eq 200) {
            Write-Host "  ✅ Health check PASSED" -ForegroundColor Green
        }
    } catch {
        Write-Warning "  ⚠  Health check not yet responding. Check logs: flyctl logs --app $FLY_APP_NAME"
    }
} else {
    Write-Host "  ⏭  Skipped. Deploy manually: flyctl deploy --app $FLY_APP_NAME" -ForegroundColor Yellow
}

# ─── Summary ───────────────────────────────────────────────────────────────────
Write-Step "Setup Summary"
Write-Host @"
  App:         https://$FLY_APP_NAME.fly.dev
  Dashboard:   https://fly.io/apps/$FLY_APP_NAME
  Logs:        flyctl logs --app $FLY_APP_NAME
  SSH:         flyctl ssh console --app $FLY_APP_NAME
  Scale:       flyctl scale count 2 --app $FLY_APP_NAME
"@

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
