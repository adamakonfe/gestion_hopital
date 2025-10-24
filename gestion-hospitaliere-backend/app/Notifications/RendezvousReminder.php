<?php

namespace App\Notifications;

use App\Models\Rendezvous;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification de rappel de rendez-vous (24h avant)
 */
class RendezvousReminder extends Notification implements ShouldQueue
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
            ->subject('Rappel de rendez-vous - Hôpital')
            ->greeting('Bonjour ' . $rdv->patient->user->name . ',')
            ->line('Nous vous rappelons votre rendez-vous prévu demain :')
            ->line('**Médecin :** Dr. ' . $rdv->medecin->user->name)
            ->line('**Date et heure :** ' . $rdv->date_heure->format('d/m/Y à H:i'))
            ->line('**Motif :** ' . $rdv->motif)
            ->line('Merci de vous présenter 10 minutes avant l\'heure prévue.')
            ->action('Voir les détails', url('/rendezvous/' . $rdv->id))
            ->line('En cas d\'empêchement, merci de nous contacter au plus vite.');
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
            'type' => 'reminder',
        ];
    }
}
