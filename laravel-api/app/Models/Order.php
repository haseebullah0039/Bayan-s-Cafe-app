<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'order_number',
        'customer_name',
        'customer_phone',
        'order_type',
        'table_number',
        'delivery_address',
        'status',
        'subtotal',
        'total',
        'notes',
        'fcm_token',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'total' => 'float',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public static function generateOrderNumber(int $restaurantId): string
    {
        $date = now()->format('Ymd');
        $count = static::whereDate('created_at', today())->count() + 1;
        return "BC-{$date}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
