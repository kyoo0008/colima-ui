# Colima UI Launcher Script for Windows
# 빌드된 앱 실행 또는 개발 모드 실행

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AppName = "Colima UI"
$ExePath = Join-Path $ScriptDir "src-tauri\target\release\Colima UI.exe"
$MsiPath = Join-Path $ScriptDir "src-tauri\target\release\bundle\msi"

function Show-Help {
    Write-Host "Usage: colima-ui.ps1 [OPTION]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Dev        개발 모드로 실행 (npm run tauri dev)"
    Write-Host "  -Build      앱 빌드 (npm run tauri build)"
    Write-Host "  -Install    MSI 설치 프로그램 실행"
    Write-Host "  -Help       도움말 표시"
    Write-Host ""
    Write-Host "옵션 없이 실행하면 빌드된 앱을 실행합니다."
}

function Start-App {
    # 빌드된 exe 확인
    if (Test-Path $ExePath) {
        Write-Host "Colima UI 실행 중..."
        Start-Process $ExePath
        return
    }

    # 설치된 앱 확인 (Program Files)
    $InstalledPath = "C:\Program Files\Colima UI\Colima UI.exe"
    if (Test-Path $InstalledPath) {
        Write-Host "설치된 Colima UI 실행 중..."
        Start-Process $InstalledPath
        return
    }

    Write-Host "빌드된 앱이 없습니다. 먼저 빌드하세요:"
    Write-Host "  .\colima-ui.ps1 -Build"
    Write-Host ""
    Write-Host "또는 개발 모드로 실행:"
    Write-Host "  .\colima-ui.ps1 -Dev"
    exit 1
}

function Start-Dev {
    Write-Host "개발 모드로 실행 중..."
    Set-Location $ScriptDir
    npm run tauri dev
}

function Start-Build {
    Write-Host "Colima UI 빌드 중..."
    Set-Location $ScriptDir
    npm run tauri build

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "빌드 완료!"
        Write-Host "EXE 위치: $ExePath"
        Write-Host "MSI 위치: $MsiPath"
        Write-Host ""
        Write-Host "MSI 설치 프로그램을 실행하려면:"
        Write-Host "  .\colima-ui.ps1 -Install"
    }
}

function Start-Install {
    $MsiFiles = Get-ChildItem -Path $MsiPath -Filter "*.msi" -ErrorAction SilentlyContinue

    if (-not $MsiFiles) {
        Write-Host "빌드된 MSI가 없습니다. 먼저 빌드하세요:"
        Write-Host "  .\colima-ui.ps1 -Build"
        exit 1
    }

    $MsiFile = $MsiFiles | Select-Object -First 1
    Write-Host "MSI 설치 프로그램 실행 중: $($MsiFile.Name)"
    Start-Process msiexec.exe -ArgumentList "/i", "`"$($MsiFile.FullName)`"" -Wait
}

# 메인 로직
param(
    [switch]$Dev,
    [switch]$Build,
    [switch]$Install,
    [switch]$Help
)

if ($Help) {
    Show-Help
} elseif ($Dev) {
    Start-Dev
} elseif ($Build) {
    Start-Build
} elseif ($Install) {
    Start-Install
} else {
    Start-App
}
