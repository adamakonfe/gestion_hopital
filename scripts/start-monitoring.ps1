# Script PowerShell pour démarrer le système de monitoring
# Usage: .\scripts\start-monitoring.ps1

param(
    [switch]$SkipMainApp = $false,
    [switch]$Verbose = $false
)

# Configuration
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ErrorActionPreference = "Stop"

# Fonctions utilitaires
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Vérification des prérequis
function Test-Requirements {
    Write-Info "Vérification des prérequis..."
    
    # Vérifier Docker
    try {
        $dockerVersion = docker --version
        Write-Success "Docker détecté: $dockerVersion"
    }
    catch {
        Write-Error "Docker n'est pas installé ou non accessible"
        exit 1
    }
    
    # Vérifier Docker Compose
    try {
        $composeVersion = docker-compose --version
        Write-Success "Docker Compose détecté: $composeVersion"
    }
    catch {
        Write-Error "Docker Compose n'est pas installé ou non accessible"
        exit 1
    }
}

# Démarrage de l'application principale
function Start-MainApplication {
    if ($SkipMainApp) {
        Write-Info "Démarrage de l'application principale ignoré (--SkipMainApp)"
        return
    }
    
    Write-Info "Vérification de l'application principale..."
    
    Set-Location $ProjectRoot
    
    # Vérifier si l'application est déjà en cours d'exécution
    $runningContainers = docker-compose ps --services --filter "status=running"
    
    if ($runningContainers) {
        Write-Success "Application principale déjà en cours d'exécution"
    }
    else {
        Write-Info "Démarrage de l'application principale..."
        docker-compose up -d
        
        Write-Info "Attente du démarrage des services (30 secondes)..."
        Start-Sleep -Seconds 30
    }
}

# Démarrage du système de monitoring
function Start-Monitoring {
    Write-Info "Démarrage du système de monitoring..."
    
    Set-Location $ProjectRoot
    
    # Créer les répertoires nécessaires
    $directories = @(
        "monitoring\prometheus\data",
        "monitoring\grafana\data", 
        "monitoring\alertmanager\data"
    )
    
    foreach ($dir in $directories) {
        $fullPath = Join-Path $ProjectRoot $dir
        if (!(Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-Info "Répertoire créé: $dir"
        }
    }
    
    # Démarrer les services de monitoring
    Write-Info "Lancement des conteneurs de monitoring..."
    docker-compose -f docker-compose.monitoring.yml up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services de monitoring démarrés avec succès"
    }
    else {
        Write-Error "Erreur lors du démarrage des services de monitoring"
        exit 1
    }
}

# Vérification de l'état des services
function Test-Services {
    Write-Info "Vérification de l'état des services..."
    
    # Attendre que les services soient prêts
    Write-Info "Attente du démarrage complet (60 secondes)..."
    Start-Sleep -Seconds 60
    
    $services = @(
        @{Name="Prometheus"; Url="http://localhost:9090/-/healthy"; Port=9090},
        @{Name="Grafana"; Url="http://localhost:3001/api/health"; Port=3001},
        @{Name="AlertManager"; Url="http://localhost:9093/-/healthy"; Port=9093},
        @{Name="Application Metrics"; Url="http://localhost:8000/api/metrics"; Port=8000}
    )
    
    foreach ($service in $services) {
        try {
            $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 10 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "✅ $($service.Name): http://localhost:$($service.Port)"
            }
            else {
                Write-Warning "⚠️ $($service.Name): Réponse inattendue (Code: $($response.StatusCode))"
            }
        }
        catch {
            Write-Warning "⚠️ $($service.Name): Non accessible sur le port $($service.Port)"
        }
    }
}

# Affichage des informations d'accès
function Show-AccessInfo {
    Write-Host ""
    Write-Host "=== SYSTÈME DE MONITORING DÉMARRÉ ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Success "🔍 Prometheus (Métriques): http://localhost:9090"
    Write-Success "📊 Grafana (Dashboards): http://localhost:3001"
    Write-Success "   └── Identifiants: admin / admin123"
    Write-Success "🚨 AlertManager (Alertes): http://localhost:9093"
    Write-Success "📈 Node Exporter: http://localhost:9100"
    Write-Success "🐳 cAdvisor: http://localhost:8080"
    Write-Host ""
    Write-Info "📋 Dashboards Grafana disponibles:"
    Write-Info "   - Hospital Management - Vue d'ensemble"
    Write-Info "   - Système & Infrastructure"
    Write-Info "   - Base de Données - MySQL & Redis"
    Write-Host ""
    Write-Info "🔧 Pour arrêter le monitoring:"
    Write-Info "   docker-compose -f docker-compose.monitoring.yml down"
    Write-Host ""
}

# Configuration post-démarrage
function Set-PostConfiguration {
    Write-Info "Configuration post-démarrage..."
    
    # Attendre que Grafana soit complètement démarré
    Write-Info "Attente du démarrage complet de Grafana..."
    
    $maxAttempts = 30
    $attempt = 0
    
    do {
        $attempt++
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "Grafana est prêt"
                break
            }
        }
        catch {
            if ($attempt -lt $maxAttempts) {
                Start-Sleep -Seconds 2
            }
        }
    } while ($attempt -lt $maxAttempts)
    
    if ($attempt -eq $maxAttempts) {
        Write-Warning "Grafana met du temps à démarrer, mais le processus continue..."
    }
    
    Write-Success "Configuration terminée"
}

# Fonction principale
function Main {
    try {
        Write-Info "🚀 Démarrage du système de monitoring pour l'hôpital"
        
        Test-Requirements
        Start-MainApplication
        Start-Monitoring
        Test-Services
        Set-PostConfiguration
        Show-AccessInfo
        
        Write-Success "🎉 Système de monitoring opérationnel !"
        
        # Ouvrir automatiquement Grafana dans le navigateur
        $openBrowser = Read-Host "Voulez-vous ouvrir Grafana dans votre navigateur ? (o/N)"
        if ($openBrowser -eq "o" -or $openBrowser -eq "O" -or $openBrowser -eq "oui") {
            Start-Process "http://localhost:3001"
        }
    }
    catch {
        Write-Error "Erreur lors du démarrage du monitoring: $($_.Exception.Message)"
        Write-Info "Consultez les logs avec: docker-compose -f docker-compose.monitoring.yml logs"
        exit 1
    }
}

# Point d'entrée
if ($Verbose) {
    $VerbosePreference = "Continue"
}

Main
