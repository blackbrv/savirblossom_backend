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
        $query = Bouquet::with(['category', 'galleries']);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $isUnfilterred = filter_var($request->input('unfilterred'), FILTER_VALIDATE_BOOLEAN);

        if (! $isUnfilterred) {
            $query->published();
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            });
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        if ($request->filled('min_stock')) {
            $query->where('stock', '>=', $request->input('min_stock'));
        }

        if ($request->filled('max_stock')) {
            $query->where('stock', '<=', $request->input('max_stock'));
        }

        if ($request->boolean('in_stock')) {
            $query->where('stock', '>', 0);
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
            'galleries.*.src' => 'required_with:galleries|string',
            'galleries.*.alt_text' => 'nullable|string',
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
            $bouquet = Bouquet::with(['category', 'galleries'])->findOrFail($id);

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

            'galleries' => 'nullable|array',
            'galleries.*.src' => 'required_with:galleries|string',
            'galleries.*.alt_text' => 'nullable|string',

            'published' => 'sometimes|required|boolean',
        ]);

        $bouquet->update($validated);

        if ($request->has('galleries')) {
            foreach ($request->galleries as $imageData) {
                if (isset($imageData['id'])) {
                    $bouquet->galleries()->where('id', $imageData['id'])->update([
                        'src' => $imageData['src'],
                        'alt_text' => $imageData['alt_text'] ?? null,
                    ]);
                } else {
                    $bouquet->galleries()->create([
                        'src' => $imageData['src'],
                        'alt_text' => $imageData['alt_text'] ?? null,
                    ]);
                }
            }
        }

        return response()->json([
            'message' => "Bouquet {$id} Updated successfully",
            'data' => $bouquet->fresh()->load(['category', 'galleries']),
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
