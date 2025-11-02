# Script PowerShell pour déployer le monitoring sur kind (Kubernetes in Docker)
# Usage: .\k8s\deploy-kind.ps1

param(
    [switch]$Delete = $false,
    [switch]$Recreate = $false
)

Write-Host "🚀 Déploiement du système de monitoring sur kind" -ForegroundColor Cyan

# Vérifier les prérequis
function Test-Prerequisites {
    # Vérifier Docker
    try {
        docker version | Out-Null
        Write-Host "✅ Docker détecté" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Docker n'est pas disponible" -ForegroundColor Red
        exit 1
    }
    
    # Vérifier kubectl
    try {
        kubectl version --client | Out-Null
        Write-Host "✅ kubectl détecté" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ kubectl n'est pas installé" -ForegroundColor Red
        exit 1
    }
    
    # Vérifier kind
    try {
        kind version | Out-Null
        Write-Host "✅ kind détecté" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ kind n'est pas installé" -ForegroundColor Red
        Write-Host "Installez kind avec: winget install Kubernetes.kind" -ForegroundColor Yellow
        exit 1
    }
}

# Créer le cluster kind
function New-KindCluster {
    Write-Host "🔄 Création du cluster kind..." -ForegroundColor Yellow
    
    # Vérifier si le cluster existe déjà
    $existingCluster = kind get clusters | Where-Object { $_ -eq "hospital-monitoring" }
    
    if ($existingCluster -and -not $Recreate) {
        Write-Host "✅ Cluster 'hospital-monitoring' existe déjà" -ForegroundColor Green
        return
    }
    
    if ($existingCluster -and $Recreate) {
        Write-Host "🗑️ Suppression du cluster existant..." -ForegroundColor Yellow
        kind delete cluster --name hospital-monitoring
    }
    
    # Créer le nouveau cluster
    kind create cluster --config k8s/kind-config.yaml
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Cluster kind créé avec succès" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Erreur lors de la création du cluster" -ForegroundColor Red
        exit 1
    }
    
    # Attendre que le cluster soit prêt
    Write-Host "⏳ Attente de la disponibilité du cluster..." -ForegroundColor Yellow
    kubectl wait --for=condition=Ready nodes --all --timeout=300s
}

# Déployer les ressources
function Deploy-Resources {
    Write-Host "📦 Déploiement des ressources Kubernetes..." -ForegroundColor Blue
    
    $files = @(
        "namespace.yaml",
        "persistent-volumes.yaml",
        "prometheus-config.yaml",
        "grafana-config.yaml",
        "prometheus-deployment.yaml",
        "grafana-deployment.yaml",
        "node-exporter-deployment.yaml",
        "cadvisor-deployment.yaml",
        "alertmanager-deployment.yaml"
    )
    
    foreach ($file in $files) {
        $filePath = "k8s\$file"
        
        if (Test-Path $filePath) {
            Write-Host "📋 Déploiement de $file..." -ForegroundColor Gray
            kubectl apply -f $filePath
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ $file déployé" -ForegroundColor Green
            }
            else {
                Write-Host "❌ Erreur lors du déploiement de $file" -ForegroundColor Red
            }
        }
        else {
            Write-Host "⚠️ Fichier $filePath non trouvé" -ForegroundColor Yellow
        }
    }
}

# Attendre que les pods soient prêts
function Wait-ForPods {
    Write-Host "⏳ Attente du démarrage des pods..." -ForegroundColor Yellow
    
    # Attendre Prometheus
    kubectl wait --for=condition=ready pod -l app=prometheus -n hospital-monitoring --timeout=300s
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prometheus prêt" -ForegroundColor Green
    }
    
    # Attendre Grafana
    kubectl wait --for=condition=ready pod -l app=grafana -n hospital-monitoring --timeout=300s
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Grafana prêt" -ForegroundColor Green
    }
    
    # Attendre AlertManager
    kubectl wait --for=condition=ready pod -l app=alertmanager -n hospital-monitoring --timeout=300s
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ AlertManager prêt" -ForegroundColor Green
    }
}

# Afficher les informations d'accès
function Show-AccessInfo {
    Write-Host ""
    Write-Host "🎉 Déploiement terminé !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Accès aux services via localhost:" -ForegroundColor Cyan
    Write-Host "📊 Grafana: http://localhost:30300 (admin/admin123)" -ForegroundColor Green
    Write-Host "🔍 Prometheus: http://localhost:30090" -ForegroundColor Green
    Write-Host "🚨 AlertManager: http://localhost:30093" -ForegroundColor Green
    Write-Host "🐳 cAdvisor: http://localhost:30080" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Commandes utiles:" -ForegroundColor Cyan
    Write-Host "   kubectl get pods -n hospital-monitoring" -ForegroundColor Gray
    Write-Host "   kubectl get services -n hospital-monitoring" -ForegroundColor Gray
    Write-Host "   kubectl logs -f deployment/prometheus -n hospital-monitoring" -ForegroundColor Gray
    Write-Host "   kind delete cluster --name hospital-monitoring  # Pour supprimer" -ForegroundColor Gray
}

# Supprimer les ressources
function Remove-Resources {
    Write-Host "🗑️ Suppression des ressources..." -ForegroundColor Red
    
    # Supprimer le namespace (supprime tout)
    kubectl delete namespace hospital-monitoring --ignore-not-found=true
    
    # Supprimer le cluster kind
    kind delete cluster --name hospital-monitoring
    
    Write-Host "✅ Suppression terminée" -ForegroundColor Green
}

# Fonction principale
function Main {
    Test-Prerequisites
    
    if ($Delete) {
        Remove-Resources
        return
    }
    
    New-KindCluster
    Deploy-Resources
    Wait-ForPods
    Show-AccessInfo
    
    # Proposer d'ouvrir les services
    $openServices = Read-Host "Voulez-vous ouvrir Grafana dans le navigateur ? (o/N)"
    if ($openServices -eq "o" -or $openServices -eq "O") {
        Start-Process "http://localhost:30300"
    }
}

# Gestion des erreurs
trap {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Exécution
Main
