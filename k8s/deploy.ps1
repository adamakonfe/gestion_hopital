# Script PowerShell pour déployer le monitoring sur Kubernetes
# Usage: .\k8s\deploy.ps1

param(
    [switch]$Minikube = $false,
    [switch]$Delete = $false
)

Write-Host "🚀 Déploiement du système de monitoring sur Kubernetes" -ForegroundColor Cyan

# Vérifier kubectl
try {
    kubectl version --client | Out-Null
    Write-Host "✅ kubectl détecté" -ForegroundColor Green
}
catch {
    Write-Host "❌ kubectl n'est pas installé" -ForegroundColor Red
    exit 1
}

# Si Minikube, démarrer le cluster
if ($Minikube) {
    Write-Host "🔄 Démarrage de Minikube..." -ForegroundColor Yellow
    minikube start --driver=docker --memory=4096 --cpus=2
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors du démarrage de Minikube" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Minikube démarré" -ForegroundColor Green
}

# Fonction pour appliquer ou supprimer les ressources
function Deploy-Resources {
    param([bool]$Delete)
    
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
            if ($Delete) {
                Write-Host "🗑️ Suppression de $file..." -ForegroundColor Yellow
                kubectl delete -f $filePath --ignore-not-found=true
            }
            else {
                Write-Host "📦 Déploiement de $file..." -ForegroundColor Blue
                kubectl apply -f $filePath
                
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "❌ Erreur lors du déploiement de $file" -ForegroundColor Red
                }
                else {
                    Write-Host "✅ $file déployé avec succès" -ForegroundColor Green
                }
            }
        }
        else {
            Write-Host "⚠️ Fichier $filePath non trouvé" -ForegroundColor Yellow
        }
    }
}

# Déployer ou supprimer
if ($Delete) {
    Write-Host "🗑️ Suppression des ressources..." -ForegroundColor Red
    Deploy-Resources -Delete $true
    Write-Host "✅ Suppression terminée" -ForegroundColor Green
}
else {
    Write-Host "📦 Déploiement des ressources..." -ForegroundColor Blue
    Deploy-Resources -Delete $false
    
    # Attendre que les pods soient prêts
    Write-Host "⏳ Attente du démarrage des pods..." -ForegroundColor Yellow
    kubectl wait --for=condition=ready pod -l app=prometheus -n hospital-monitoring --timeout=300s
    kubectl wait --for=condition=ready pod -l app=grafana -n hospital-monitoring --timeout=300s
    
    # Afficher les informations d'accès
    Write-Host ""
    Write-Host "🎉 Déploiement terminé !" -ForegroundColor Green
    Write-Host ""
    
    if ($Minikube) {
        $minikubeIP = minikube ip
        Write-Host "📊 Grafana: http://$minikubeIP`:30300 (admin/admin123)" -ForegroundColor Green
        Write-Host "🔍 Prometheus: http://$minikubeIP`:30090" -ForegroundColor Green
        Write-Host "🚨 AlertManager: http://$minikubeIP`:30093" -ForegroundColor Green
        Write-Host "🐳 cAdvisor: http://$minikubeIP`:30080" -ForegroundColor Green
    }
    else {
        Write-Host "📊 Grafana: http://localhost:30300 (admin/admin123)" -ForegroundColor Green
        Write-Host "🔍 Prometheus: http://localhost:30090" -ForegroundColor Green
        Write-Host "🚨 AlertManager: http://localhost:30093" -ForegroundColor Green
        Write-Host "🐳 cAdvisor: http://localhost:30080" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "📋 Commandes utiles:" -ForegroundColor Cyan
    Write-Host "   kubectl get pods -n hospital-monitoring" -ForegroundColor Gray
    Write-Host "   kubectl get services -n hospital-monitoring" -ForegroundColor Gray
    Write-Host "   kubectl logs -f deployment/prometheus -n hospital-monitoring" -ForegroundColor Gray
}

# Proposer d'ouvrir les services
if (-not $Delete -and $Minikube) {
    $openServices = Read-Host "Voulez-vous ouvrir les services dans le navigateur ? (o/N)"
    if ($openServices -eq "o" -or $openServices -eq "O") {
        $minikubeIP = minikube ip
        Start-Process "http://$minikubeIP`:30300"  # Grafana
        Start-Process "http://$minikubeIP`:30090"  # Prometheus
    }
}
