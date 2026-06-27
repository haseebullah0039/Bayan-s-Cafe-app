<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function store(Request $request, NotificationService $notifications)
    {
        $validator = Validator::make($request->all(), [
            'restaurant_id'    => 'required|exists:restaurants,id',
            'customer_name'    => 'required|string|max:100',
            'customer_phone'   => 'required|string|max:20',
            'order_type'       => 'required|in:dine_in,delivery',
            'table_number'     => 'required_if:order_type,dine_in',
            'delivery_address' => 'required_if:order_type,delivery',
            'items'            => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.price'      => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order = DB::transaction(function () use ($request) {
            $subtotal = collect($request->items)->sum(
                fn($i) => $i['price'] * $i['quantity']
            );

            $order = Order::create([
                'restaurant_id'    => $request->restaurant_id,
                'order_number'     => Order::generateOrderNumber($request->restaurant_id),
                'customer_name'    => $request->customer_name,
                'customer_phone'   => $request->customer_phone,
                'order_type'       => $request->order_type,
                'table_number'     => $request->table_number,
                'delivery_address' => $request->delivery_address,
                'status'           => 'placed',
                'subtotal'         => $subtotal,
                'total'            => $subtotal,
                'fcm_token'        => $request->fcm_token,
            ]);

            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                $order->items()->create([
                    'product_id'   => $item['product_id'],
                    'product_name' => $product->name,
                    'price'        => $item['price'],
                    'quantity'     => $item['quantity'],
                    'subtotal'     => $item['price'] * $item['quantity'],
                ]);
            }

            return $order->load('items');
        });

        $notifications->notifyAdmin($order, 'New Order Received!');

        return response()->json(['data' => $order], 201);
    }

    public function track(string $orderNumber)
    {
        $order = Order::with('items')
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return response()->json(['data' => $order]);
    }
}
