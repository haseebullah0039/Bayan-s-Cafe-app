<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('items')
            ->where('restaurant_id', auth()->user()->restaurant_id)
            ->latest();

        if ($request->status && $request->status !== 'active') {
            $query->where('status', $request->status);
        } elseif ($request->status === 'active') {
            $query->whereNotIn('status', ['received', 'delivered']);
        }

        $orders = $query->paginate(50);
        return response()->json(['data' => $orders]);
    }

    public function show(string $id)
    {
        $order = Order::with('items')->findOrFail($id);
        return response()->json(['data' => $order]);
    }

    public function updateStatus(Request $request, string $id, NotificationService $notifications)
    {
        $request->validate([
            'status' => 'required|in:placed,preparing,ready,on_the_way,delivered,received',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        // Push notification to customer
        if ($order->fcm_token) {
            $messages = [
                'preparing'  => 'Your order is being prepared 👨‍🍳',
                'ready'      => 'Your order is ready! 🔔',
                'on_the_way' => 'Your order is on the way 🛵',
                'delivered'  => 'Your order has been delivered 📦',
            ];
            $msg = $messages[$request->status] ?? null;
            if ($msg) {
                $notifications->pushToCustomer($order->fcm_token, 'Order Update', $msg);
            }
        }

        return response()->json(['data' => $order]);
    }
}
