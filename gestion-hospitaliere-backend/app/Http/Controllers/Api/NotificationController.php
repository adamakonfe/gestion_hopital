<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * Contrôleur pour gérer les notifications utilisateur
 */
class NotificationController extends Controller
{
    /**
     * Récupérer toutes les notifications de l'utilisateur
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($notifications);
    }

    /**
     * Récupérer les notifications non lues
     */
    public function unread(Request $request)
    {
        $user = $request->user();
        
        $notifications = $user->unreadNotifications()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'count' => $notifications->count(),
            'notifications' => $notifications
        ]);
    }

    /**
     * Marquer une notification comme lue
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        
        $notification = $user->notifications()->find($id);

        if (!$notification) {
            return response()->json(['message' => 'Notification non trouvée'], 404);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Notification marquée comme lue']);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        
        $user->unreadNotifications->markAsRead();

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues']);
    }

    /**
     * Supprimer une notification
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        $notification = $user->notifications()->find($id);

        if (!$notification) {
            return response()->json(['message' => 'Notification non trouvée'], 404);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification supprimée']);
    }

    /**
     * Supprimer toutes les notifications lues
     */
    public function deleteRead(Request $request)
    {
        $user = $request->user();
        
        $user->readNotifications()->delete();

        return response()->json(['message' => 'Notifications lues supprimées']);
    }
}
