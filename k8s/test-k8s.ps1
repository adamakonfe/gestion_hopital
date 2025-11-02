# Script de test pour le déploiement Kubernetes
# Usage: .\k8s\test-k8s.ps1

param(
    [switch]$Minikube = $false
)

Write-Host "🧪 Test du déploiement Kubernetes - Monitoring Hospitalier" -ForegroundColor Cyan

# Fonction pour tester un service
function Test-K8sService {
    param(
        [string]$ServiceName,
        [string]$Namespace,
        [int]$Port,
        [string]$Path = "/"
    )
    
    try {
        # Obtenir l'IP du service
        if ($Minikube) {
            $minikubeIP = minikube ip
            $url = "http://$minikubeIP`:$Port$Path"
        }
        else {
            $url = "http://localhost:$Port$Path"
        }
        
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -UseBasicParsing
        Write-Host "✅ $ServiceName : $url (Status: $($response.StatusCode))" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ $ServiceName : $url (Erreur: $($_.Exception.Message))" -ForegroundColor Red
        return $false
    }
}

# Vérifier l'état des pods
Write-Host "📋 État des pods:" -ForegroundColor Yellow
kubectl get pods -n hospital-monitoring

Write-Host ""
Write-Host "📋 État des services:" -ForegroundColor Yellow
kubectl get services -n hospital-monitoring

Write-Host ""
Write-Host "🔍 Test de connectivité des services:" -ForegroundColor Yellow

$services = @(
    @{Name="Prometheus"; Port=30090; Path="/-/healthy"},
    @{Name="Grafana"; Port=30300; Path="/api/health"},
    @{Name="AlertManager"; Port=30093; Path="/-/healthy"},
    @{Name="cAdvisor"; Port=30080; Path="/healthz"}
)

$successCount = 0
foreach ($service in $services) {
    if (Test-K8sService -ServiceName $service.Name -Namespace "hospital-monitoring" -Port $service.Port -Path $service.Path) {
        $successCount++
    }
}

Write-Host ""
Write-Host "📊 Résumé des tests:" -ForegroundColor Cyan
Write-Host "   Services testés: $($services.Count)" -ForegroundColor Gray
Write-Host "   Services OK: $successCount" -ForegroundColor Green
Write-Host "   Taux de réussite: $([math]::Round(($successCount / $services.Count) * 100, 1))%" -ForegroundColor $(if ($successCount -eq $services.Count) { "Green" } else { "Yellow" })

# Vérifier les métriques Prometheus
Write-Host ""
Write-Host "🔍 Test des métriques Prometheus:" -ForegroundColor Yellow

try {
    if ($Minikube) {
        $minikubeIP = minikube ip
        $prometheusUrl = "http://$minikubeIP`:30090"
    }
    else {
        $prometheusUrl = "http://localhost:30090"
    }
    
    $metricsResponse = Invoke-WebRequest -Uri "$prometheusUrl/api/v1/query?query=up" -UseBasicParsing
    $metricsData = $metricsResponse.Content | ConvertFrom-Json
    
    if ($metricsData.status -eq "success") {
        $upTargets = ($metricsData.data.result | Where-Object { $_.value[1] -eq "1" }).Count
        $totalTargets = $metricsData.data.result.Count
        Write-Host "✅ Métriques Prometheus: $upTargets/$totalTargets targets UP" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Impossible de récupérer les métriques Prometheus" -ForegroundColor Red
}

# Afficher les logs récents en cas de problème
if ($successCount -lt $services.Count) {
    Write-Host ""
    Write-Host "📋 Logs récents des services en échec:" -ForegroundColor Yellow
    
    $pods = kubectl get pods -n hospital-monitoring -o jsonpath='{.items[*].metadata.name}'
    foreach ($pod in $pods.Split(' ')) {
        if ($pod) {
            Write-Host "--- Logs de $pod ---" -ForegroundColor Gray
            kubectl logs $pod -n hospital-monitoring --tail=5
        }
    }
}

Write-Host ""
Write-Host "🎯 Commandes utiles pour le debugging:" -ForegroundColor Cyan
Write-Host "   kubectl describe pods -n hospital-monitoring" -ForegroundColor Gray
Write-Host "   kubectl logs -f deployment/prometheus -n hospital-monitoring" -ForegroundColor Gray
Write-Host "   kubectl port-forward service/grafana-service 3000:3000 -n hospital-monitoring" -ForegroundColor Gray

if ($Minikube) {
    Write-Host "   minikube dashboard" -ForegroundColor Gray
    Write-Host "   minikube service list -n hospital-monitoring" -ForegroundColor Gray
}
