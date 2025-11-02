# Script PowerShell simplifié pour démarrer le monitoring
# Usage: .\scripts\start-monitoring-simple.ps1

Write-Host "🚀 Démarrage du système de monitoring..." -ForegroundColor Blue

# Vérifier Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker détecté: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker n'est pas installé" -ForegroundColor Red
    exit 1
}

# Vérifier Docker Compose
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose détecté: $composeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker Compose n'est pas installé" -ForegroundColor Red
    exit 1
}

# Créer les répertoires nécessaires
Write-Host "📁 Création des répertoires..." -ForegroundColor Blue

$directories = @(
    "monitoring\prometheus\data",
    "monitoring\grafana\data", 
    "monitoring\alertmanager\data"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   ✅ Répertoire créé: $dir" -ForegroundColor Green
    }
}

# Démarrer les services de monitoring
Write-Host "🐳 Démarrage des conteneurs de monitoring..." -ForegroundColor Blue
docker-compose -f docker-compose.monitoring.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Services de monitoring démarrés avec succès" -ForegroundColor Green
}
else {
    Write-Host "❌ Erreur lors du démarrage" -ForegroundColor Red
    exit 1
}

# Attendre le démarrage
Write-Host "⏳ Attente du démarrage complet (30 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Afficher les informations d'accès
Write-Host ""
Write-Host "=== SYSTÈME DE MONITORING DÉMARRÉ ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 Prometheus: http://localhost:9090" -ForegroundColor Green
Write-Host "📊 Grafana: http://localhost:3001 (admin/admin123)" -ForegroundColor Green
Write-Host "🚨 AlertManager: http://localhost:9093" -ForegroundColor Green
Write-Host "📈 Node Exporter: http://localhost:9100" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Monitoring opérationnel !" -ForegroundColor Green

# Proposer d'ouvrir Grafana
$openBrowser = Read-Host "Voulez-vous ouvrir Grafana ? (o/N)"
if ($openBrowser -eq "o" -or $openBrowser -eq "O") {
    Start-Process "http://localhost:3001"
}
