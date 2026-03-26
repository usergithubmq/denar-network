<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue; // <--- 1. AGREGAR ESTO
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

// 2. AGREGAR "implements ShouldQueue" AQUÍ
class BienvenidoPagadorMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;
    public $cliente;

    public function __construct($user, $cliente)
    {
        $this->user = $user;
        $this->cliente = $cliente;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Acceso a tu Terminal de Pagos - ' . ($this->cliente->nombre_comercial ?? 'KoonPay'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.bienvenida',
        );
    }
}
