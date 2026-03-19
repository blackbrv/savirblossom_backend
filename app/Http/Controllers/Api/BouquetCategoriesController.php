<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BouquetCategories;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BouquetCategoriesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $perPage = min($request->get('per_page', 10), 50);
        $query = BouquetCategories::query();

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

        if ($request->has('published')) {
            $query->where('published', $request->boolean('published'));
        }

        $categories = $query->paginate($perPage);

        return response()->json($categories);

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:bouquet_categories,name',
            'description' => 'nullable|string',
        ]);

        $categories = BouquetCategories::create([
            ...$validated,
            'published' => false,
        ]);

        return response()->json([
            'message' => "Bouquet categories {$categories->name} created",
            'data' => $categories,
        ], 201);
    }
    //

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $categories = BouquetCategories::findOrFail($id);

            return response()->json([
                'data' => $categories,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => "Bouquet Categoreis {$id} is not found",
            ], 404);
        }

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {

            $categories = BouquetCategories::findOrFail($id);

            $validated = $request->validate([
                'name' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('bouquet_categories', 'name')->ignore($id),
                ],
                'description' => 'nullable|string',
                'published' => 'sometimes|boolean',
            ]);

            $categories->update($validated);

            return response()->json([
                'message' => "Bouquet categories {$id} Updated successfully",
                'data' => $categories,
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => "Bouquet Categoreis {$id} is not found",
            ], 404);
        }

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $category = BouquetCategories::findOrFail($id);
            $category->delete();

            return response()->json([
                'message' => "Category {$id} deleted successfully",
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => "Category {$id} not found",
            ], 404);
        }
    }
}
