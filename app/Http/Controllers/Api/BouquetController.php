<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bouquet;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BouquetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $perPage = min($request->get('per_page', 10), 50);

        $query = Bouquet::with('category')->published();

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $bouquets = $query->paginate($perPage);

        return response()->json($bouquets);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:bouquets,name',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'category_id' => 'required|exist:bouquet_categories,id',

            'galleries' => 'nullable|array',
            'galleries.*.id' => 'required_with:galleries|integer',
            'galleries.*.src' => 'required_with:galleries|string',
            'galleries.*.alt' => 'nullable|string',
        ]);

        $validated['galleries'] ??= null;

        $bouquet = Bouquet::create($validated);

        return response()->json([
            'message' => 'Bouquet created successfully',
            'data' => $bouquet->fresh()->load('category'),
        ], 201);
    }

    public function togglePublish(string $id)
    {
        try {

            $bouquet = Bouquet::with('category')->findOrFail($id);

            $bouquet->update([
                'published' => ! $bouquet->published,
            ]);

            return response()->json([
                'message' => "Bouquet {$bouquet->name} published",
                'data' => $bouquet,
            ], 201);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => "Bouquet {$id} is not found",
            ], 404);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $bouquet = Bouquet::with('category')->findOrFail($id);

            return response()->json([
                'data' => $bouquet,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => "Bouquet {$id} is not found",
            ], 404);
        }

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $bouquet = Bouquet::findOrFail($id);

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('bouquets', 'name')->ignore($id),
            ],
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric',
            'stock' => 'sometimes|required|integer',
            'category_id' => 'sometimes|required|exists:bouquet_categories,id',
        ]);

        $bouquet->update($validated);

        return response()->json([
            'message' => "Bouquet {$id} Updated successfully",
            'data' => $bouquet->fresh()->load('category'),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $bouquet = Bouquet::findOrFail($id);
        $bouquet->delete();

        return response()->json([
            'message' => "Bouquet {$id} deleted successfully",
            'data' => $bouquet,
        ]);
    }
}
