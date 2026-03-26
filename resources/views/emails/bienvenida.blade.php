<div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
    @if($cliente->logo_url)
        <img src="{{ $message->embed(storage_path('app/public/' . $cliente->logo_url)) }}" style="height: 50px; margin-bottom: 20px;">
    @endif

    <h2 style="color: #14b8a6;">¡Bienvenido, {{ $user->name }}!</h2>
    <p>Has sido dado de alta en la plataforma de pagos de <strong>{{ $cliente->nombre_comercial }}</strong>.</p>
    
    <div style="background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 14px; color: #64748b;">Tus credenciales de acceso:</p>
        <p style="margin: 5px 0;"><strong>Usuario:</strong> {{ $user->email }}</p>
        <p style="margin: 5px 0;"><strong>Contraseña:</strong> Tu RFC ({{ $user->rfc }})</p>
    </div>

    <p style="margin-top: 20px;">Puedes consultar tu CLABE interbancaria y estado de cuenta aquí:</p>
    
    <a href="{{ config('app.url') }}/login" style="background: #14b8a6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
        Ir a mi Billetera
    </a>

    <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">
    <p style="font-size: 10px; color: #999; text-align: center;">Powered by KoonPay - Nodo B2C</p>
</div>