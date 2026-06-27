<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'price',
        'quantity',
        'subtotal',
    ];

    protected $casts = [
        'price' => 'float',
        'subtotal' => 'float',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
