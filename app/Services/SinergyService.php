<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SinergyService
{
    public function generateCashReference($orderData)
    {
        try {
            $url = env('SINERGY_URL');
            $apiKey = env('SINERGY_API_KEY');

            // Según la doc: cashin/references
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->withBasicAuth($apiKey, '')
                ->post($url . 'cashin/references', [
                    'amount'             => (string)$orderData['amount'],
                    'name'               => $orderData['name'],
                    'email'              => $orderData['email'],
                    'phone'              => $orderData['phone'] ?? '0000000000',
                    'expiration_minutes' => "9999",
                    'custom_data'        => $orderData['external_id']
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data'    => $response->json()['data'] // Retornamos solo el nodo 'data' que trae la 'reference'
                ];
            }

            Log::error("Sinergy Error: " . $response->body());
            return ['success' => false, 'message' => 'Error en SinergyPay'];
        } catch (\Exception $e) {
            Log::error("Sinergy Exception: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error de conexión'];
        }
    }
}
