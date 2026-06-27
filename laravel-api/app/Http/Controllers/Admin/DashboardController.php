<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;

class DashboardController extends Controller
{
    public function index()
    {
        $restaurantId = auth()->user()->restaurant_id;

        $data = [
            'today_orders' => Order::where('restaurant_id', $restaurantId)
                ->whereDate('created_at', today())
                ->count(),

            'today_revenue' => Order::where('restaurant_id', $restaurantId)
                ->whereDate('created_at', today())
                ->whereIn('status', ['delivered', 'received'])
                ->sum('total'),

            'active_orders' => Order::where('restaurant_id', $restaurantId)
                ->whereNotIn('status', ['delivered', 'received'])
                ->count(),

            'completed_orders' => Order::where('restaurant_id', $restaurantId)
                ->whereDate('created_at', today())
                ->whereIn('status', ['delivered', 'received'])
                ->count(),
        ];

        return response()->json(['data' => $data]);
    }
}
