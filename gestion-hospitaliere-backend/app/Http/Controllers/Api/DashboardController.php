<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Medecin;
use App\Models\Rendezvous;
use App\Models\Chambre;
use App\Models\Lit;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Contrôleur pour le tableau de bord et les statistiques
 */
class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function index()
    {
        return response()->json([
            'statistiques_generales' => $this->getStatistiquesGenerales(),
            'rendezvous_aujourdhui' => $this->getRendezvousAujourdhui(),
            'occupation_lits' => $this->getOccupationLits(),
            'rendezvous_par_statut' => $this->getRendezvousParStatut(),
            'patients_par_service' => $this->getPatientsParService(),
            'activite_recente' => $this->getActiviteRecente(),
        ]);
    }

    /**
     * Statistiques générales
     */
    private function getStatistiquesGenerales()
    {
        return [
            'total_patients' => Patient::count(),
            'total_medecins' => Medecin::count(),
            'total_chambres' => Chambre::count(),
            'total_lits' => Lit::count(),
            'lits_disponibles' => Lit::where('statut', 'disponible')->count(),
            'lits_occupes' => Lit::where('statut', 'occupe')->count(),
            'rendezvous_aujourdhui' => Rendezvous::whereDate('date_heure', today())->count(),
            'rendezvous_semaine' => Rendezvous::whereBetween('date_heure', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ])->count(),
        ];
    }

    /**
     * Rendez-vous d'aujourd'hui
     */
    private function getRendezvousAujourdhui()
    {
        return Rendezvous::with(['patient.user', 'medecin.user'])
            ->whereDate('date_heure', today())
            ->orderBy('date_heure')
            ->get()
            ->map(function ($rdv) {
                return [
                    'id' => $rdv->id,
                    'heure' => $rdv->date_heure->format('H:i'),
                    'patient' => $rdv->patient->user->name,
                    'medecin' => $rdv->medecin->user->name,
                    'motif' => $rdv->motif,
                    'statut' => $rdv->statut,
                ];
            });
    }

    /**
     * Taux d'occupation des lits
     */
    private function getOccupationLits()
    {
        $total = Lit::count();
        $occupes = Lit::where('statut', 'occupe')->count();
        $disponibles = Lit::where('statut', 'disponible')->count();
        $maintenance = Lit::where('statut', 'maintenance')->count();

        return [
            'total' => $total,
            'occupes' => $occupes,
            'disponibles' => $disponibles,
            'maintenance' => $maintenance,
            'taux_occupation' => $total > 0 ? round(($occupes / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Rendez-vous par statut
     */
    private function getRendezvousParStatut()
    {
        return Rendezvous::select('statut', DB::raw('count(*) as total'))
            ->groupBy('statut')
            ->get()
            ->map(function ($item) {
                return [
                    'statut' => $item->statut,
                    'total' => $item->total,
                ];
            });
    }

    /**
     * Patients par service
     */
    private function getPatientsParService()
    {
        return Service::withCount(['medecins', 'chambres'])
            ->get()
            ->map(function ($service) {
                return [
                    'service' => $service->nom,
                    'medecins' => $service->medecins_count,
                    'chambres' => $service->chambres_count,
                ];
            });
    }

    /**
     * Activité récente (derniers rendez-vous créés)
     */
    private function getActiviteRecente()
    {
        return Rendezvous::with(['patient.user', 'medecin.user'])
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($rdv) {
                return [
                    'id' => $rdv->id,
                    'type' => 'rendez-vous',
                    'description' => "RDV: {$rdv->patient->user->name} avec Dr. {$rdv->medecin->user->name}",
                    'date' => $rdv->created_at->format('Y-m-d H:i'),
                ];
            });
    }

    /**
     * Statistiques pour les graphiques
     */
    public function graphiques(Request $request)
    {
        $periode = $request->get('periode', '7days'); // 7days, 30days, 12months

        return response()->json([
            'rendezvous_par_jour' => $this->getRendezvousParJour($periode),
            'patients_par_mois' => $this->getPatientsParMois(),
            'occupation_chambres_par_type' => $this->getOccupationChambresParType(),
        ]);
    }

    /**
     * Rendez-vous par jour
     */
    private function getRendezvousParJour($periode)
    {
        $days = $periode === '30days' ? 30 : 7;
        
        return Rendezvous::select(
                DB::raw('DATE(date_heure) as date'),
                DB::raw('count(*) as total')
            )
            ->where('date_heure', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    /**
     * Nouveaux patients par mois (12 derniers mois)
     */
    private function getPatientsParMois()
    {
        return Patient::select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as mois'),
                DB::raw('count(*) as total')
            )
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();
    }

    /**
     * Occupation des chambres par type
     */
    private function getOccupationChambresParType()
    {
        return Chambre::select('type', DB::raw('count(*) as total'))
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                $litsOccupes = Lit::whereHas('chambre', function ($query) use ($item) {
                    $query->where('type', $item->type);
                })->where('statut', 'occupe')->count();

                $litsTotal = Lit::whereHas('chambre', function ($query) use ($item) {
                    $query->where('type', $item->type);
                })->count();

                return [
                    'type' => $item->type,
                    'chambres' => $item->total,
                    'lits_total' => $litsTotal,
                    'lits_occupes' => $litsOccupes,
                    'taux_occupation' => $litsTotal > 0 ? round(($litsOccupes / $litsTotal) * 100, 2) : 0,
                ];
            });
    }
}
