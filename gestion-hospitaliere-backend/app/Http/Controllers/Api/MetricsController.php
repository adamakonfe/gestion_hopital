<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Patient;
use App\Models\Medecin;
use App\Models\Rendezvous;
use Illuminate\Support\Facades\DB;

class MetricsController extends Controller
{
    /**
     * Expose metrics in Prometheus format
     */
    public function index()
    {
        $metrics = [];

        // Total users count
        $totalUsers = User::count();
        $metrics[] = "# HELP hospital_users_total Total number of users";
        $metrics[] = "# TYPE hospital_users_total gauge";
        $metrics[] = "hospital_users_total $totalUsers";

        // Users by role
        $usersByRole = User::select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->get();
        
        $metrics[] = "# HELP hospital_users_by_role Number of users by role";
        $metrics[] = "# TYPE hospital_users_by_role gauge";
        foreach ($usersByRole as $roleData) {
            $role = strtolower($roleData->role);
            $count = $roleData->count;
            $metrics[] = "hospital_users_by_role{role=\"$role\"} $count";
        }

        // Total patients
        $totalPatients = Patient::count();
        $metrics[] = "# HELP hospital_patients_total Total number of patients";
        $metrics[] = "# TYPE hospital_patients_total gauge";
        $metrics[] = "hospital_patients_total $totalPatients";

        // Total medecins
        $totalMedecins = Medecin::count();
        $metrics[] = "# HELP hospital_medecins_total Total number of doctors";
        $metrics[] = "# TYPE hospital_medecins_total gauge";
        $metrics[] = "hospital_medecins_total $totalMedecins";

        // Total appointments
        $totalRendezvous = Rendezvous::count();
        $metrics[] = "# HELP hospital_appointments_total Total number of appointments";
        $metrics[] = "# TYPE hospital_appointments_total gauge";
        $metrics[] = "hospital_appointments_total $totalRendezvous";

        // Appointments by status
        $rendezvousByStatus = Rendezvous::select('statut', DB::raw('count(*) as count'))
            ->groupBy('statut')
            ->get();
        
        $metrics[] = "# HELP hospital_appointments_by_status Number of appointments by status";
        $metrics[] = "# TYPE hospital_appointments_by_status gauge";
        foreach ($rendezvousByStatus as $statusData) {
            $status = strtolower($statusData->statut);
            $count = $statusData->count;
            $metrics[] = "hospital_appointments_by_status{status=\"$status\"} $count";
        }

        // Today's appointments
        $todayAppointments = Rendezvous::whereDate('date_heure', today())->count();
        $metrics[] = "# HELP hospital_appointments_today Number of appointments today";
        $metrics[] = "# TYPE hospital_appointments_today gauge";
        $metrics[] = "hospital_appointments_today $todayAppointments";

        // Pending appointments
        $pendingAppointments = Rendezvous::where('statut', 'En attente')->count();
        $metrics[] = "# HELP hospital_appointments_pending Number of pending appointments";
        $metrics[] = "# TYPE hospital_appointments_pending gauge";
        $metrics[] = "hospital_appointments_pending $pendingAppointments";

        // Database connection status
        try {
            DB::connection()->getPdo();
            $dbStatus = 1;
        } catch (\Exception $e) {
            $dbStatus = 0;
        }
        $metrics[] = "# HELP hospital_database_up Database connection status (1=up, 0=down)";
        $metrics[] = "# TYPE hospital_database_up gauge";
        $metrics[] = "hospital_database_up $dbStatus";

        // Return metrics in plain text format
        return response(implode("\n", $metrics) . "\n")
            ->header('Content-Type', 'text/plain; version=0.0.4');
    }
}
