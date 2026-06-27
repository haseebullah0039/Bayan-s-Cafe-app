<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->string('order_number', 30)->unique();
            $table->string('customer_name', 100);
            $table->string('customer_phone', 20);
            $table->enum('order_type', ['dine_in', 'delivery']);
            $table->string('table_number', 10)->nullable();
            $table->text('delivery_address')->nullable();
            $table->enum('status', ['placed', 'preparing', 'ready', 'on_the_way', 'delivered', 'received'])
                  ->default('placed');
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->string('fcm_token')->nullable();
            $table->timestamps();

            $table->index(['restaurant_id', 'status']);
            $table->index(['restaurant_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
