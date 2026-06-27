<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Cloudinary\Cloudinary;

class UploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => config('services.cloudinary.cloud_name'),
                'api_key'    => config('services.cloudinary.api_key'),
                'api_secret' => config('services.cloudinary.api_secret'),
            ],
        ]);

        $result = $cloudinary->uploadApi()->upload(
            $request->file('image')->getRealPath(),
            [
                'folder' => 'bayans-cafe/products',
                'transformation' => [
                    'width' => 800,
                    'height' => 600,
                    'crop' => 'fill',
                    'quality' => 'auto',
                    'fetch_format' => 'auto',
                ],
            ]
        );

        return response()->json([
            'url' => $result['secure_url'],
            'public_id' => $result['public_id'],
        ]);
    }
}
