<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\MedecinController;
use App\Http\Controllers\Api\RendezvousController;
use App\Http\Controllers\Api\PrescriptionController;
use App\Http\Controllers\Api\FactureController;
use App\Http\Controllers\Api\ChambreController;
use App\Http\Controllers\Api\LitController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'service' => 'Hospital Management API'
    ]);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public services endpoint for registration
Route::get('/services', [ServiceController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

    // Dashboard - All authenticated users
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/graphiques', [DashboardController::class, 'graphiques']);

    // Services - Admin only (except index which is public)
    Route::middleware('role:Admin')->group(function () {
        Route::post('/services', [ServiceController::class, 'store']);
        Route::get('/services/{service}', [ServiceController::class, 'show']);
        Route::put('/services/{service}', [ServiceController::class, 'update']);
        Route::delete('/services/{service}', [ServiceController::class, 'destroy']);
    });

    // Patients - Admin and Medecins
    Route::middleware('role:Admin,Médecin')->group(function () {
        Route::apiResource('patients', PatientController::class);
        Route::get('/patients/{patient}/documents/{documentIndex}', [PatientController::class, 'downloadDocument']);
        Route::delete('/patients/{patient}/documents/{documentIndex}', [PatientController::class, 'deleteDocument']);
    });

    // Medecins
    // Allow all authenticated users to list medecins (used by patients to réserver un rendez-vous)
    Route::get('/medecins', [MedecinController::class, 'index']);
    // Other Medecin management routes restricted to Admin
    Route::middleware('role:Admin')->apiResource('medecins', MedecinController::class)->except(['index']);

    // Rendezvous - All authenticated users
    Route::apiResource('rendezvous', RendezvousController::class);
    Route::put('/rendezvous/{rendezvous}/status', [RendezvousController::class, 'updateStatus']);

    // Prescriptions - Medecins only
    Route::middleware('role:Médecin')->apiResource('prescriptions', PrescriptionController::class);

    // Factures - Admin only
    Route::middleware('role:Admin')->apiResource('factures', FactureController::class);

    // Chambres - Admin only (except index and disponibles)
    Route::get('/chambres', [ChambreController::class, 'index']);
    Route::get('/chambres/disponibles', [ChambreController::class, 'disponibles']);
    Route::middleware('role:Admin')->group(function () {
        Route::post('/chambres', [ChambreController::class, 'store']);
        Route::get('/chambres/{chambre}', [ChambreController::class, 'show']);
        Route::put('/chambres/{chambre}', [ChambreController::class, 'update']);
        Route::delete('/chambres/{chambre}', [ChambreController::class, 'destroy']);
    });

    // Lits - Admin and Infirmier
    Route::get('/lits', [LitController::class, 'index']);
    Route::get('/lits/disponibles', [LitController::class, 'disponibles']);
    Route::middleware('role:Admin,Infirmier')->group(function () {
        Route::post('/lits', [LitController::class, 'store']);
        Route::get('/lits/{lit}', [LitController::class, 'show']);
        Route::put('/lits/{lit}', [LitController::class, 'update']);
        Route::delete('/lits/{lit}', [LitController::class, 'destroy']);
        Route::post('/lits/{lit}/assigner', [LitController::class, 'assignerPatient']);
        Route::post('/lits/{lit}/liberer', [LitController::class, 'liberer']);
    });

    // Notifications - All authenticated users
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications/read', [NotificationController::class, 'deleteRead']);
});
