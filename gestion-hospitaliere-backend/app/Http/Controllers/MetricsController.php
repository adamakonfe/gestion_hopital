<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Patient;
use App\Models\Medecin;
use App\Models\Rendezvous;
use App\Models\Prescription;
use App\Models\Facture;
use App\Models\Lit;
use Illuminate\Http\Response;

class MetricsController extends Controller
{
    /**
     * Expose Prometheus metrics
     */
    public function index()
    {
        // Compter les entités
        $usersCount = User::count();
        $patientsCount = Patient::count();
        $medecinsCount = Medecin::count();
        $rendezvousCount = Rendezvous::count();
        $prescriptionsCount = Prescription::count();
        $facturesCount = Facture::count();
        $litsTotal = Lit::count();
        $litsOccupes = Lit::where('statut', 'occupé')->count();

        // Générer les métriques au format Prometheus
        $metrics = <<<METRICS
# HELP hospital_users_total Total number of users
# TYPE hospital_users_total gauge
hospital_users_total $usersCount

# HELP hospital_patients_total Total number of patients
# TYPE hospital_patients_total gauge
hospital_patients_total $patientsCount

# HELP hospital_medecins_total Total number of doctors
# TYPE hospital_medecins_total gauge
hospital_medecins_total $medecinsCount

# HELP hospital_rendezvous_total Total number of appointments
# TYPE hospital_rendezvous_total gauge
hospital_rendezvous_total $rendezvousCount

# HELP hospital_prescriptions_total Total number of prescriptions
# TYPE hospital_prescriptions_total gauge
hospital_prescriptions_total $prescriptionsCount

# HELP hospital_factures_total Total number of invoices
# TYPE hospital_factures_total gauge
hospital_factures_total $facturesCount

# HELP hospital_lits_total Total number of beds
# TYPE hospital_lits_total gauge
hospital_lits_total $litsTotal

# HELP hospital_lits_occupes Number of occupied beds
# TYPE hospital_lits_occupes gauge
hospital_lits_occupes $litsOccupes

METRICS;

        return response($metrics, 200)
            ->header('Content-Type', 'text/plain; version=0.0.4');
    }
}
