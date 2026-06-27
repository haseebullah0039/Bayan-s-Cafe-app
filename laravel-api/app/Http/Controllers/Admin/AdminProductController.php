<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    public function index()
    {
        $products = Product::where('restaurant_id', auth()->user()->restaurant_id)
            ->with('category')
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => $products]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id'  => 'required|exists:categories,id',
            'name'         => 'required|string|max:150',
            'description'  => 'nullable|string',
            'price'        => 'required|numeric|min:0',
            'image_url'    => 'nullable|url',
            'is_available' => 'boolean',
        ]);

        $product = Product::create([
            ...$request->only(['category_id', 'name', 'description', 'price', 'image_url', 'is_available']),
            'restaurant_id' => auth()->user()->restaurant_id,
        ]);

        return response()->json(['data' => $product], 201);
    }

    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);
        $product->update($request->only([
            'category_id', 'name', 'description', 'price', 'image_url', 'is_available', 'sort_order',
        ]));

        return response()->json(['data' => $product]);
    }

    public function destroy(string $id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'Product deleted'], 200);
    }
}
