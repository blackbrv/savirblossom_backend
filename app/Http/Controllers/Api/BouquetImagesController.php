<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bouquet;
use App\Models\BouquetImage;
use Illuminate\Http\Request;

class BouquetImagesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Bouquet $bouquet)
    {
        // dd($bouquet);
        return response()->json([
            'data' => $bouquet->galleries,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Bouquet $bouquet)
    {
        $validated = $request->validate([
            'src' => 'required|string',
            'alt_text' => 'nullable|string',
        ]);

        $image = $bouquet->galleries()->create($validated);

        return response()->json([
            'message' => 'Image added to gallery',
            'data' => $image,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $bouquet, string $id)
    {
        $image = BouquetImage::where('id', $id)
            ->where('bouquet_id', $bouquet)
            ->firstOrFail();

        $validated = $request->validate([
            'src' => 'sometimes|string',
            'alt_text' => 'nullable|string',
        ]);

        $image->update($validated);

        return response()->json([
            'message' => "Image {$id} updated successfully",
            'data' => $image,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Bouquet $bouquet, string $id)
    {
        $image = BouquetImage::where('id', $id)
            ->where('bouquet_id', $bouquet->id)
            ->firstOrFail();

        $image->delete();

        return response()->json([
            'message' => "Image {$id} deleted successfully {$bouquet->name}",
        ]);
    }
}
