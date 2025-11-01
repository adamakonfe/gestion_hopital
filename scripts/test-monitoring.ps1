# Script de test pour le système de monitoring
# Usage: .\scripts\test-monitoring.ps1

param(
    [switch]$Detailed = $false,
    [switch]$GenerateLoad = $false
)

$ErrorActionPreference = "Continue"

# Fonctions utilitaires
function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Details = ""
    )
    
    $status = if ($Success) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($Success) { "Green" } else { "Red" }
    
    Write-Host "[$status] $TestName" -ForegroundColor $color
    if ($Details -and ($Detailed -or -not $Success)) {
        Write-Host "    └── $Details" -ForegroundColor Gray
    }
}

function Test-ServiceHealth {
    param(
        [string]$ServiceName,
        [string]$Url,
        [int]$ExpectedStatus = 200,
        [int]$TimeoutSec = 10
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSec -UseBasicParsing
        $success = $response.StatusCode -eq $ExpectedStatus
        $details = "Status: $($response.StatusCode), Response time: $($response.Headers.'X-Response-Time' ?? 'N/A')"
        Write-TestResult "Service $ServiceName" $success $details
        return $success
    }
    catch {
        Write-TestResult "Service $ServiceName" $false "Error: $($_.Exception.Message)"
        return $false
    }
}

function Test-PrometheusMetrics {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9090/api/v1/query?query=up" -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.status -eq "success" -and $data.data.result.Count -gt 0) {
            $upServices = ($data.data.result | Where-Object { $_.value[1] -eq "1" }).Count
            $totalServices = $data.data.result.Count
            Write-TestResult "Prometheus Metrics Collection" $true "Services UP: $upServices/$totalServices"
            return $true
        }
        else {
            Write-TestResult "Prometheus Metrics Collection" $false "No metrics data available"
            return $false
        }
    }
    catch {
        Write-TestResult "Prometheus Metrics Collection" $false "Error: $($_.Exception.Message)"
        return $false
    }
}

function Test-HospitalMetrics {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/metrics" -UseBasicParsing
        $content = $response.Content
        
        $hospitalMetrics = @(
            "hospital_active_patients",
            "hospital_total_beds", 
            "hospital_available_beds",
            "hospital_appointments_today"
        )
        
        $foundMetrics = 0
        foreach ($metric in $hospitalMetrics) {
            if ($content -match $metric) {
                $foundMetrics++
            }
        }
        
        $success = $foundMetrics -eq $hospitalMetrics.Count
        Write-TestResult "Hospital Custom Metrics" $success "Found: $foundMetrics/$($hospitalMetrics.Count) metrics"
        return $success
    }
    catch {
        Write-TestResult "Hospital Custom Metrics" $false "Error: $($_.Exception.Message)"
        return $false
    }
}

function Test-GrafanaDashboards {
    try {
        # Test de connexion avec les identifiants par défaut
        $credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:admin123"))
        $headers = @{
            "Authorization" = "Basic $credentials"
        }
        
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/search" -Headers $headers -UseBasicParsing
        $dashboards = $response.Content | ConvertFrom-Json
        
        $expectedDashboards = @("Hospital Management", "Système", "Base de Données")
        $foundDashboards = 0
        
        foreach ($expected in $expectedDashboards) {
            if ($dashboards | Where-Object { $_.title -like "*$expected*" }) {
                $foundDashboards++
            }
        }
        
        $success = $foundDashboards -gt 0
        Write-TestResult "Grafana Dashboards" $success "Found: $foundDashboards dashboard(s)"
        return $success
    }
    catch {
        Write-TestResult "Grafana Dashboards" $false "Error: $($_.Exception.Message)"
        return $false
    }
}

function Test-AlertManager {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9093/api/v1/alerts" -UseBasicParsing
        $alerts = $response.Content | ConvertFrom-Json
        
        Write-TestResult "AlertManager API" $true "Active alerts: $($alerts.data.Count)"
        return $true
    }
    catch {
        Write-TestResult "AlertManager API" $false "Error: $($_.Exception.Message)"
        return $false
    }
}

function Test-ContainerHealth {
    try {
        $containers = docker ps --format "table {{.Names}}\t{{.Status}}" --filter "name=hospital_"
        $runningContainers = ($containers | Select-String "Up").Count
        $totalContainers = ($containers | Measure-Object).Count - 1 # Exclure l'en-tête
        
        $success = $runningContainers -gt 0
        Write-TestResult "Docker Containers" $success "Running: $runningContainers/$totalContainers"
        return $success
    }
    catch {
        Write-TestResult "Docker Containers" $false "Error: $($_.Exception.Message)"
        return $false
    }
}

function Generate-TestLoad {
    if (-not $GenerateLoad) {
        return
    }
    
    Write-Host "`n🔄 Génération de charge de test..." -ForegroundColor Yellow
    
    $endpoints = @(
        "http://localhost:8000/api/health",
        "http://localhost:8000/api/metrics",
        "http://localhost:8000/api/services"
    )
    
    $jobs = @()
    
    foreach ($endpoint in $endpoints) {
        $job = Start-Job -ScriptBlock {
            param($url)
            for ($i = 1; $i -le 50; $i++) {
                try {
                    Invoke-WebRequest -Uri $url -UseBasicParsing | Out-Null
                    Start-Sleep -Milliseconds 100
                }
                catch {
                    # Ignorer les erreurs pour le test de charge
                }
            }
        } -ArgumentList $endpoint
        
        $jobs += $job
    }
    
    Write-Host "Attente de la fin de la génération de charge..." -ForegroundColor Yellow
    $jobs | Wait-Job | Remove-Job
    
    Write-Host "✅ Charge de test générée" -ForegroundColor Green
    Start-Sleep -Seconds 5
}

function Show-MonitoringStatus {
    Write-Host "`n📊 État détaillé du monitoring:" -ForegroundColor Cyan
    
    # Métriques Prometheus
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9090/api/v1/label/__name__/values" -UseBasicParsing
        $metrics = ($response.Content | ConvertFrom-Json).data
        Write-Host "   • Métriques disponibles: $($metrics.Count)" -ForegroundColor Gray
    }
    catch {
        Write-Host "   • Métriques Prometheus: Non disponibles" -ForegroundColor Red
    }
    
    # Targets Prometheus
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9090/api/v1/targets" -UseBasicParsing
        $targets = ($response.Content | ConvertFrom-Json).data.activeTargets
        $upTargets = ($targets | Where-Object { $_.health -eq "up" }).Count
        Write-Host "   • Targets Prometheus: $upTargets/$($targets.Count) UP" -ForegroundColor Gray
    }
    catch {
        Write-Host "   • Targets Prometheus: Non disponibles" -ForegroundColor Red
    }
    
    # Espace disque des volumes
    try {
        $volumes = docker volume ls --filter "name=hospital" --format "{{.Name}}"
        Write-Host "   • Volumes Docker: $($volumes.Count) volumes créés" -ForegroundColor Gray
    }
    catch {
        Write-Host "   • Volumes Docker: Erreur de vérification" -ForegroundColor Red
    }
}

# Fonction principale
function Main {
    Write-Host "🧪 Test du système de monitoring - Gestion Hospitalière" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Gray
    
    $allTests = @()
    
    # Tests de base
    Write-Host "`n🔍 Tests de connectivité des services:" -ForegroundColor Yellow
    $allTests += Test-ServiceHealth "Prometheus" "http://localhost:9090/-/healthy"
    $allTests += Test-ServiceHealth "Grafana" "http://localhost:3001/api/health"
    $allTests += Test-ServiceHealth "AlertManager" "http://localhost:9093/-/healthy"
    $allTests += Test-ServiceHealth "Node Exporter" "http://localhost:9100/metrics"
    $allTests += Test-ServiceHealth "Application Backend" "http://localhost:8000/api/health"
    
    # Tests fonctionnels
    Write-Host "`n🔧 Tests fonctionnels:" -ForegroundColor Yellow
    $allTests += Test-PrometheusMetrics
    $allTests += Test-HospitalMetrics
    $allTests += Test-GrafanaDashboards
    $allTests += Test-AlertManager
    $allTests += Test-ContainerHealth
    
    # Génération de charge si demandée
    Generate-TestLoad
    
    # Résumé des tests
    Write-Host "`n📋 Résumé des tests:" -ForegroundColor Cyan
    $passedTests = ($allTests | Where-Object { $_ -eq $true }).Count
    $totalTests = $allTests.Count
    $successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)
    
    Write-Host "   • Tests réussis: $passedTests/$totalTests ($successRate%)" -ForegroundColor $(if ($successRate -ge 80) { "Green" } else { "Yellow" })
    
    if ($successRate -eq 100) {
        Write-Host "🎉 Tous les tests sont passés ! Le monitoring fonctionne parfaitement." -ForegroundColor Green
    }
    elseif ($successRate -ge 80) {
        Write-Host "✅ La plupart des tests sont passés. Le monitoring fonctionne correctement." -ForegroundColor Yellow
    }
    else {
        Write-Host "⚠️ Plusieurs tests ont échoué. Vérifiez la configuration du monitoring." -ForegroundColor Red
    }
    
    # Affichage détaillé si demandé
    if ($Detailed) {
        Show-MonitoringStatus
    }
    
    # Recommandations
    Write-Host "`n💡 Prochaines étapes recommandées:" -ForegroundColor Cyan
    Write-Host "   1. Ouvrir Grafana: http://localhost:3001 (admin/admin123)" -ForegroundColor Gray
    Write-Host "   2. Vérifier les dashboards pré-configurés" -ForegroundColor Gray
    Write-Host "   3. Tester les alertes avec: .\scripts\test-monitoring.ps1 -GenerateLoad" -ForegroundColor Gray
    Write-Host "   4. Personnaliser les seuils d'alerte dans .env.monitoring" -ForegroundColor Gray
}

# Exécution
Main
