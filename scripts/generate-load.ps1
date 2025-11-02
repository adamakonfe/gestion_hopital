# Script pour générer de la charge et tester le monitoring
# Usage: .\scripts\generate-load.ps1

Write-Host "🔥 Génération de charge pour tester le monitoring..." -ForegroundColor Yellow

# Fonction pour faire des requêtes HTTP
function Generate-HttpLoad {
    param([string]$Url, [int]$Requests = 100)
    
    Write-Host "📡 Génération de $Requests requêtes vers $Url" -ForegroundColor Blue
    
    for ($i = 1; $i -le $Requests; $i++) {
        try {
            Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 | Out-Null
            if ($i % 10 -eq 0) {
                Write-Host "   Requête $i/$Requests" -ForegroundColor Gray
            }
        }
        catch {
            # Ignorer les erreurs pour continuer le test
        }
        Start-Sleep -Milliseconds 100
    }
}

# Fonction pour consommer du CPU
function Generate-CpuLoad {
    param([int]$Seconds = 30)
    
    Write-Host "⚡ Génération de charge CPU pendant $Seconds secondes" -ForegroundColor Blue
    
    $endTime = (Get-Date).AddSeconds($Seconds)
    $jobs = @()
    
    # Créer plusieurs jobs pour utiliser plusieurs cœurs
    for ($i = 1; $i -le 4; $i++) {
        $job = Start-Job -ScriptBlock {
            param($EndTime)
            while ((Get-Date) -lt $EndTime) {
                $result = 1..1000 | ForEach-Object { $_ * $_ }
            }
        } -ArgumentList $endTime
        $jobs += $job
    }
    
    # Attendre la fin
    $jobs | Wait-Job | Remove-Job
    Write-Host "✅ Charge CPU terminée" -ForegroundColor Green
}

# Tests de charge
Write-Host "🎯 Démarrage des tests de charge..." -ForegroundColor Cyan

# Test 1: Charge HTTP sur l'application
Generate-HttpLoad -Url "http://localhost:3000" -Requests 50
Generate-HttpLoad -Url "http://localhost:8000" -Requests 50

# Test 2: Charge CPU
Generate-CpuLoad -Seconds 20

# Test 3: Requêtes vers Prometheus
Generate-HttpLoad -Url "http://localhost:9090/api/v1/query?query=up" -Requests 30

Write-Host "✅ Tests de charge terminés!" -ForegroundColor Green
Write-Host "📊 Vérifiez maintenant vos dashboards Grafana pour voir l'impact:" -ForegroundColor Cyan
Write-Host "   http://localhost:3001" -ForegroundColor Blue
