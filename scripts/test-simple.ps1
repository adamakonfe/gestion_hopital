# Test simple du système de monitoring
Write-Host "=== TEST DU SYSTEME DE MONITORING ===" -ForegroundColor Cyan

# Test 1: Conteneurs Docker
Write-Host "`n1. CONTENEURS DOCKER:" -ForegroundColor Yellow
docker ps --filter "name=hospital" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Test 2: Services Web
Write-Host "`n2. SERVICES WEB:" -ForegroundColor Yellow

$services = @(
    @{Name="Prometheus"; Url="http://localhost:9090/-/healthy"},
    @{Name="Grafana"; Url="http://localhost:3001/api/health"},
    @{Name="Node Exporter"; Url="http://localhost:9100/metrics"},
    @{Name="cAdvisor"; Url="http://localhost:8080/healthz"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 5 -UseBasicParsing
        Write-Host "✅ $($service.Name): OK (Status: $($response.StatusCode))" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ $($service.Name): ERREUR" -ForegroundColor Red
    }
}

# Test 3: Métriques Prometheus
Write-Host "`n3. METRIQUES PROMETHEUS:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9090/api/v1/targets" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    $upTargets = ($data.data.activeTargets | Where-Object { $_.health -eq "up" }).Count
    $totalTargets = $data.data.activeTargets.Count
    Write-Host "🎯 Targets: $upTargets/$totalTargets UP" -ForegroundColor Green
}
catch {
    Write-Host "❌ Impossible de récupérer les targets" -ForegroundColor Red
}

# Test 4: URLs d'accès
Write-Host "`n4. URLS D'ACCES:" -ForegroundColor Yellow
Write-Host "📊 Grafana: http://localhost:3001 (admin/admin123)" -ForegroundColor Blue
Write-Host "🔍 Prometheus: http://localhost:9090" -ForegroundColor Blue
Write-Host "🏥 Application: http://localhost:3000" -ForegroundColor Blue
Write-Host "🐳 cAdvisor: http://localhost:8080" -ForegroundColor Blue

Write-Host "`n=== TEST TERMINE ===" -ForegroundColor Cyan
