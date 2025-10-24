<?php

namespace App\Notifications;

use App\Models\Rendezvous;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification envoyée au médecin quand un rendez-vous lui est assigné
 */
class RendezvousAssigned extends Notification implements ShouldQueue
{
    use Queueable;

    protected $rendezvous;

    /**
     * Create a new notification instance.
     */
    public function __construct(Rendezvous $rendezvous)
    {
        $this->rendezvous = $rendezvous;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        $patient = $this->rendezvous->patient;
        $dateHeure = \Carbon\Carbon::parse($this->rendezvous->date_heure);

        return (new MailMessage)
            ->subject('Nouveau Rendez-vous Assigné')
            ->greeting('Bonjour Dr. ' . $notifiable->name)
            ->line('Un nouveau rendez-vous vous a été assigné par l\'administration.')
            ->line('**Détails du rendez-vous:**')
            ->line('Patient: ' . ($patient->user->name ?? 'Non spécifié'))
            ->line('Date: ' . $dateHeure->format('d/m/Y'))
            ->line('Heure: ' . $dateHeure->format('H:i'))
            ->line('Motif: ' . $this->rendezvous->motif)
            ->line('Statut: ' . $this->rendezvous->statut)
            ->action('Voir le rendez-vous', url('/'))
            ->line('Merci de confirmer votre disponibilité.');
    }

    /**
     * Get the array representation of the notification (pour database).
     */
    public function toArray($notifiable): array
    {
        $patient = $this->rendezvous->patient;
        $dateHeure = \Carbon\Carbon::parse($this->rendezvous->date_heure);

        return [
            'type' => 'rendezvous_assigned',
            'rendezvous_id' => $this->rendezvous->id,
            'patient_name' => $patient->user->name ?? 'Non spécifié',
            'patient_id' => $patient->id,
            'date_heure' => $this->rendezvous->date_heure,
            'date_formatted' => $dateHeure->format('d/m/Y à H:i'),
            'motif' => $this->rendezvous->motif,
            'statut' => $this->rendezvous->statut,
            'message' => 'Nouveau rendez-vous avec ' . ($patient->user->name ?? 'un patient') . ' le ' . $dateHeure->format('d/m/Y à H:i'),
        ];
    }
}
