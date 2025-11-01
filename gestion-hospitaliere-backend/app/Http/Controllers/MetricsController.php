<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Medecin;
use App\Models\Rendezvous;
use App\Models\Lit;
use App\Models\Chambre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class MetricsController extends Controller
{
    /**
     * Endpoint pour les métriques Prometheus
     */
    public function prometheus()
    {
        $metrics = $this->collectMetrics();
        $httpMetrics = \App\Http\Middleware\MetricsMiddleware::getMetricsForPrometheus();
        
        $output = [];
        
        // Métriques de base
        $output[] = "# HELP hospital_active_patients Nombre de patients actifs";
        $output[] = "# TYPE hospital_active_patients gauge";
        $output[] = "hospital_active_patients {$metrics['active_patients']}";
        
        $output[] = "# HELP hospital_total_beds Nombre total de lits";
        $output[] = "# TYPE hospital_total_beds gauge";
        $output[] = "hospital_total_beds {$metrics['total_beds']}";
        
        $output[] = "# HELP hospital_available_beds Nombre de lits disponibles";
        $output[] = "# TYPE hospital_available_beds gauge";
        $output[] = "hospital_available_beds {$metrics['available_beds']}";
        
        $output[] = "# HELP hospital_appointments_today Rendez-vous aujourd'hui";
        $output[] = "# TYPE hospital_appointments_today gauge";
        $output[] = "hospital_appointments_today {$metrics['appointments_today']}";
        
        $output[] = "# HELP hospital_pending_appointments Rendez-vous en attente";
        $output[] = "# TYPE hospital_pending_appointments gauge";
        $output[] = "hospital_pending_appointments {$metrics['pending_appointments']}";
        
        $output[] = "# HELP hospital_total_doctors Nombre total de médecins";
        $output[] = "# TYPE hospital_total_doctors gauge";
        $output[] = "hospital_total_doctors {$metrics['total_doctors']}";
        
        // Métriques par service
        foreach ($metrics['beds_by_service'] as $service => $count) {
            $service_name = str_replace([' ', '-'], '_', strtolower($service));
            $output[] = "hospital_beds_by_service{service=\"{$service_name}\"} {$count}";
        }
        
        // Métriques de performance
        $output[] = "# HELP hospital_database_connections Connexions base de données actives";
        $output[] = "# TYPE hospital_database_connections gauge";
        $output[] = "hospital_database_connections {$metrics['db_connections']}";
        
        // Métriques HTTP collectées par le middleware
        $processedMetrics = [];
        foreach ($httpMetrics as $metric) {
            $metricKey = $metric['name'];
            if (!isset($processedMetrics[$metricKey])) {
                $output[] = "# HELP {$metricKey} {$metric['help']}";
                $output[] = "# TYPE {$metricKey} {$metric['type']}";
                $processedMetrics[$metricKey] = true;
            }
            
            $labels = '';
            if (!empty($metric['labels'])) {
                $labelPairs = [];
                foreach ($metric['labels'] as $key => $value) {
                    $labelPairs[] = "{$key}=\"{$value}\"";
                }
                $labels = '{' . implode(',', $labelPairs) . '}';
            }
            
            $output[] = "{$metricKey}{$labels} {$metric['value']}";
        }
        
        return response(implode("\n", $output))
            ->header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    }
    
    /**
     * Collecte toutes les métriques
     */
    private function collectMetrics()
    {
        return Cache::remember('hospital_metrics', 30, function () {
            return [
                'active_patients' => Patient::count(),
                'total_beds' => Lit::count(),
                'available_beds' => Lit::where('statut', 'disponible')->count(),
                'appointments_today' => Rendezvous::whereDate('date_heure', today())->count(),
                'pending_appointments' => Rendezvous::where('statut', 'en_attente')->count(),
                'total_doctors' => Medecin::count(),
                'beds_by_service' => $this->getBedsByService(),
                'db_connections' => $this->getDatabaseConnections(),
            ];
        });
    }
    
    /**
     * Lits par service
     */
    private function getBedsByService()
    {
        return Chambre::join('services', 'chambres.service_id', '=', 'services.id')
            ->join('lits', 'chambres.id', '=', 'lits.chambre_id')
            ->select('services.nom', DB::raw('count(*) as total'))
            ->groupBy('services.nom')
            ->pluck('total', 'nom')
            ->toArray();
    }
    
    /**
     * Connexions base de données
     */
    private function getDatabaseConnections()
    {
        try {
            $result = DB::select("SHOW STATUS LIKE 'Threads_connected'");
            return $result[0]->Value ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }
    
    /**
     * Health check endpoint
     */
    public function health()
    {
        $health = [
            'status' => 'ok',
            'timestamp' => now()->toISOString(),
            'service' => 'Hospital Management API',
            'version' => '1.0.0',
            'checks' => [
                'database' => $this->checkDatabase(),
                'redis' => $this->checkRedis(),
                'storage' => $this->checkStorage(),
            ]
        ];
        
        $allHealthy = collect($health['checks'])->every(fn($check) => $check['status'] === 'ok');
        
        return response()->json($health, $allHealthy ? 200 : 503);
    }
    
    private function checkDatabase()
    {
        try {
            DB::connection()->getPdo();
            return ['status' => 'ok', 'message' => 'Database connection successful'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Database connection failed'];
        }
    }
    
    private function checkRedis()
    {
        try {
            Cache::store('redis')->put('health_check', 'ok', 10);
            return ['status' => 'ok', 'message' => 'Redis connection successful'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Redis connection failed'];
        }
    }
    
    private function checkStorage()
    {
        try {
            $path = storage_path('app/health_check.txt');
            file_put_contents($path, 'ok');
            unlink($path);
            return ['status' => 'ok', 'message' => 'Storage write successful'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Storage write failed'];
        }
    }
}
