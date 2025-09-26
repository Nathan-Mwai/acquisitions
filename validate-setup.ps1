# Docker Setup Validation Script
Write-Host "🔍 Validating Docker Setup for Acquisitions App..." -ForegroundColor Blue
Write-Host ""

$errors = 0

# Check Docker installation
Write-Host "Checking Docker..." -NoNewline
try {
    $null = docker --version 2>$null
    Write-Host " ✅" -ForegroundColor Green
} catch {
    Write-Host " ❌ Docker not installed" -ForegroundColor Red
    $errors++
}

# Check Docker Compose
Write-Host "Checking Docker Compose..." -NoNewline
try {
    $null = docker-compose --version 2>$null
    Write-Host " ✅" -ForegroundColor Green
} catch {
    Write-Host " ❌ Docker Compose not available" -ForegroundColor Red
    $errors++
}

# Check required files
$requiredFiles = @(
    "Dockerfile",
    "docker-compose.dev.yml", 
    "docker-compose.prod.yml",
    ".dockerignore",
    ".env.development",
    ".env.production",
    "package.json",
    "src/index.js",
    "src/config/database.js"
)

Write-Host ""
Write-Host "Checking required files:" -ForegroundColor Blue

foreach ($file in $requiredFiles) {
    Write-Host "  $file..." -NoNewline
    if (Test-Path $file) {
        Write-Host " ✅" -ForegroundColor Green
    } else {
        Write-Host " ❌ Missing" -ForegroundColor Red
        $errors++
    }
}

# Check environment file content
Write-Host ""
Write-Host "Validating environment files:" -ForegroundColor Blue

if (Test-Path ".env.development") {
    $envContent = Get-Content ".env.development" -Raw
    $requiredVars = @("NEON_API_KEY", "NEON_PROJECT_ID", "PARENT_BRANCH_ID", "DATABASE_URL")
    
    foreach ($var in $requiredVars) {
        Write-Host "  .env.development -> $var..." -NoNewline
        if ($envContent -match "$var=") {
            Write-Host " ✅" -ForegroundColor Green
        } else {
            Write-Host " ❌ Missing" -ForegroundColor Red
            $errors++
        }
    }
}

if (Test-Path ".env.production") {
    $prodContent = Get-Content ".env.production" -Raw
    Write-Host "  .env.production -> DATABASE_URL..." -NoNewline
    if ($prodContent -match "DATABASE_URL=") {
        Write-Host " ✅" -ForegroundColor Green
    } else {
        Write-Host " ❌ Missing" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""

if ($errors -eq 0) {
    Write-Host "🎉 All checks passed! Your Docker setup is ready." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update .env.development with your actual Neon credentials" -ForegroundColor White
    Write-Host "2. Run: .\start-dev.ps1" -ForegroundColor White
    Write-Host "3. Visit: http://localhost:3000" -ForegroundColor White
} else {
    Write-Host "❌ $errors error(s) found. Please fix the issues above." -ForegroundColor Red
}

Write-Host ""