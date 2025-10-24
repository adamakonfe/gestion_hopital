<?php

namespace App\Notifications;

use App\Models\Rendezvous;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification envoyée lors de la création d'un rendez-vous
 */
class RendezvousCreated extends Notification implements ShouldQueue
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
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $rdv = $this->rendezvous;
        
        return (new MailMessage)
            ->subject('Confirmation de rendez-vous - Hôpital')
            ->greeting('Bonjour ' . $rdv->patient->user->name . ',')
            ->line('Votre rendez-vous a été confirmé avec les détails suivants :')
            ->line('**Médecin :** Dr. ' . $rdv->medecin->user->name)
            ->line('**Spécialité :** ' . $rdv->medecin->specialite)
            ->line('**Date et heure :** ' . $rdv->date_heure->format('d/m/Y à H:i'))
            ->line('**Motif :** ' . $rdv->motif)
            ->action('Voir mes rendez-vous', url('/rendezvous'))
            ->line('Merci de votre confiance !');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'rendezvous_id' => $this->rendezvous->id,
            'medecin' => $this->rendezvous->medecin->user->name,
            'date_heure' => $this->rendezvous->date_heure,
        ];
    }
}
