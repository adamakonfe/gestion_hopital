<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class MetricsMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        
        $response = $next($request);
        
        $duration = microtime(true) - $startTime;
        
        // Collecter les métriques
        $this->collectMetrics($request, $response, $duration);
        
        return $response;
    }
    
    /**
     * Collecter les métriques de la requête
     */
    private function collectMetrics(Request $request, Response $response, float $duration)
    {
        $method = $request->method();
        $route = $request->route() ? $request->route()->getName() ?? $request->path() : $request->path();
        $statusCode = $response->getStatusCode();
        $statusClass = $this->getStatusClass($statusCode);
        
        // Clés pour les métriques
        $requestsKey = "metrics:http_requests_total:{$method}:{$statusClass}";
        $durationKey = "metrics:http_request_duration:{$method}:{$route}";
        $activeRequestsKey = "metrics:http_active_requests";
        
        // Incrémenter le compteur de requêtes
        $this->incrementCounter($requestsKey);
        
        // Enregistrer la durée de la requête
        $this->recordDuration($durationKey, $duration);
        
        // Métriques par endpoint
        $endpointKey = "metrics:endpoint:{$route}";
        $this->incrementCounter($endpointKey);
        
        // Métriques d'erreur
        if ($statusCode >= 400) {
            $errorKey = "metrics:http_errors_total:{$method}:{$statusCode}";
            $this->incrementCounter($errorKey);
        }
        
        // Métriques spécifiques à l'hôpital
        $this->collectHospitalMetrics($request, $response);
    }
    
    /**
     * Collecter les métriques spécifiques à l'application hospitalière
     */
    private function collectHospitalMetrics(Request $request, Response $response)
    {
        $route = $request->route();
        if (!$route) return;
        
        $routeName = $route->getName();
        $method = $request->method();
        
        // Métriques par type d'opération
        switch ($routeName) {
            case 'patients.store':
            case 'patients.update':
                $this->incrementCounter('metrics:hospital_patient_operations');
                break;
                
            case 'rendezvous.store':
                $this->incrementCounter('metrics:hospital_appointment_created');
                break;
                
            case 'rendezvous.update':
                if ($request->has('statut')) {
                    $status = $request->input('statut');
                    $this->incrementCounter("metrics:hospital_appointment_status_change:{$status}");
                }
                break;
                
            case 'lits.assignerPatient':
                $this->incrementCounter('metrics:hospital_bed_assignments');
                break;
                
            case 'lits.liberer':
                $this->incrementCounter('metrics:hospital_bed_releases');
                break;
        }
        
        // Métriques d'authentification
        if (str_contains($request->path(), 'login')) {
            if ($response->getStatusCode() === 200) {
                $this->incrementCounter('metrics:hospital_successful_logins');
            } else {
                $this->incrementCounter('metrics:hospital_failed_logins');
            }
        }
    }
    
    /**
     * Incrémenter un compteur
     */
    private function incrementCounter(string $key)
    {
        Cache::increment($key, 1);
        
        // Définir une expiration pour éviter l'accumulation
        if (!Cache::has($key . '_ttl')) {
            Cache::put($key . '_ttl', true, now()->addHours(24));
        }
    }
    
    /**
     * Enregistrer la durée d'une requête
     */
    private function recordDuration(string $key, float $duration)
    {
        // Utiliser une liste pour stocker les durées (simplifié)
        $durations = Cache::get($key, []);
        $durations[] = $duration;
        
        // Garder seulement les 1000 dernières mesures
        if (count($durations) > 1000) {
            $durations = array_slice($durations, -1000);
        }
        
        Cache::put($key, $durations, now()->addHours(1));
    }
    
    /**
     * Obtenir la classe de statut HTTP
     */
    private function getStatusClass(int $statusCode): string
    {
        if ($statusCode >= 200 && $statusCode < 300) {
            return '2xx';
        } elseif ($statusCode >= 300 && $statusCode < 400) {
            return '3xx';
        } elseif ($statusCode >= 400 && $statusCode < 500) {
            return '4xx';
        } elseif ($statusCode >= 500) {
            return '5xx';
        }
        
        return 'unknown';
    }
    
    /**
     * Obtenir les métriques collectées pour Prometheus
     */
    public static function getMetricsForPrometheus(): array
    {
        $metrics = [];
        $cacheKeys = Cache::getRedis()->keys('metrics:*');
        
        foreach ($cacheKeys as $key) {
            if (str_contains($key, '_ttl')) continue;
            
            $value = Cache::get($key, 0);
            
            if (str_contains($key, 'http_requests_total')) {
                $parts = explode(':', $key);
                $method = $parts[2] ?? 'unknown';
                $status = $parts[3] ?? 'unknown';
                
                $metrics[] = [
                    'name' => 'http_requests_total',
                    'help' => 'Total number of HTTP requests',
                    'type' => 'counter',
                    'value' => $value,
                    'labels' => ['method' => $method, 'status' => $status]
                ];
            } elseif (str_contains($key, 'hospital_')) {
                $metricName = str_replace('metrics:', '', $key);
                $metrics[] = [
                    'name' => $metricName,
                    'help' => 'Hospital specific metric',
                    'type' => 'counter',
                    'value' => $value,
                    'labels' => []
                ];
            }
        }
        
        return $metrics;
    }
}
