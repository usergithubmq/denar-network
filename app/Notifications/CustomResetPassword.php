<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomResetPassword extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct($token)
    {
        $this->token = $token;
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
    public function toMail($notifiable): MailMessage
    {
        // Esto lee la URL de tu frontend desde la configuración
        $frontendUrl = config('app.frontend_url') ?? 'http://localhost:5173';

        // Construimos la URL final con el email para que React lo reciba
        $url = $frontendUrl . "/password-reset/" . $this->token . "?email=" . urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('Restablecer contraseña | Denar')
            ->greeting('¡Hola, ' . ($notifiable->name ?? 'Usuario') . '!')
            ->line('Recibimos una solicitud para restablecer la contraseña de tu cuenta en Denar.')
            ->action('Restablecer Contraseña', $url)
            ->line('Este enlace de recuperación expirará en 60 minutos.')
            ->line('Si no solicitaste este cambio, puedes ignorar este correo.')
            ->salutation('Saludos, el equipo de Denar.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
