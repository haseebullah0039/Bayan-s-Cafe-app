<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class NotificationService
{
    private string $serverKey;

    public function __construct()
    {
        $this->serverKey = config('services.firebase.server_key');
    }

    public function pushToCustomer(string $token, string $title, string $body): void
    {
        Http::withHeaders([
            'Authorization' => "key={$this->serverKey}",
            'Content-Type'  => 'application/json',
        ])->post('https://fcm.googleapis.com/fcm/send', [
            'to' => $token,
            'notification' => [
                'title' => $title,
                'body'  => $body,
                'sound' => 'default',
            ],
            'data' => [
                'type' => 'order_update',
            ],
        ]);
    }

    public function notifyAdmin(object $order, string $message): void
    {
        // Send to admin topic (all staff subscribed to "restaurant_{id}_admin")
        $topic = "restaurant_{$order->restaurant_id}_admin";

        Http::withHeaders([
            'Authorization' => "key={$this->serverKey}",
            'Content-Type'  => 'application/json',
        ])->post('https://fcm.googleapis.com/fcm/send', [
            'to' => "/topics/{$topic}",
            'notification' => [
                'title' => $message,
                'body'  => "Order #{$order->order_number} from {$order->customer_name}",
                'sound' => 'default',
            ],
        ]);
    }
}
