<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaginatedResourceCollection;
use App\Models\Promo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->get('per_page', 10), 50);
        $search = $request->input('search');
        $status = $request->input('status');

        $query = Promo::query();

        if ($search) {
            $query->where('title', 'like', '%'.$search.'%');
        }

        if ($status) {
            $query->where('status', $status);
        }

        $promos = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json(new PaginatedResourceCollection($promos));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'banner_image' => ['nullable', 'string', 'max:2048'],
            'status' => ['nullable', 'in:draft,scheduled,published,archived'],
            'scheduled_at' => ['nullable', 'date'],
            'cta_label' => ['nullable', 'string', 'max:255'],
            'cta_url' => ['nullable', 'string', 'max:2048'],
        ]);

        $promo = Promo::create($validated);

        if ($promo->status === 'published' && empty($promo->published_at)) {
            $promo->update(['published_at' => now()]);
        }

        return response()->json([
            'message' => 'Promo created successfully',
            'data' => $promo,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $promo = Promo::with('campaigns')->findOrFail($id);

        return response()->json(['data' => $promo]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $promo = Promo::findOrFail($id);

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'banner_image' => ['nullable', 'string', 'max:2048'],
            'status' => ['nullable', 'in:draft,scheduled,published,archived'],
            'scheduled_at' => ['nullable', 'date'],
            'cta_label' => ['nullable', 'string', 'max:255'],
            'cta_url' => ['nullable', 'string', 'max:2048'],
        ]);

        $promo->update($validated);

        if ($promo->status === 'published' && empty($promo->published_at)) {
            $promo->update(['published_at' => now()]);
        }

        return response()->json([
            'message' => 'Promo updated successfully',
            'data' => $promo,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $promo = Promo::findOrFail($id);
        $promo->delete();

        return response()->json([
            'message' => 'Promo deleted successfully',
        ]);
    }

    public function publish(int $id): JsonResponse
    {
        $promo = Promo::findOrFail($id);
        $promo->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        return response()->json([
            'message' => 'Promo published successfully',
            'data' => $promo,
        ]);
    }
}
