<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaginatedResourceCollection;
use App\Models\Campaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->get('per_page', 10), 50);
        $search = $request->input('search');
        $status = $request->input('status');

        $query = Campaign::with('promo');

        if ($search) {
            $query->where('subject', 'like', '%'.$search.'%');
        }

        if ($status) {
            $query->where('status', $status);
        }

        $campaigns = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json(new PaginatedResourceCollection($campaigns));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'promo_id' => ['required', 'integer', 'exists:promos,id'],
            'subject' => ['required', 'string', 'max:255'],
            'email_body' => ['nullable', 'string'],
            'scheduled_at' => ['nullable', 'date'],
        ]);

        $campaign = Campaign::create($validated);

        $campaign->load('promo');

        return response()->json([
            'message' => 'Campaign created successfully',
            'data' => $campaign,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $campaign = Campaign::with('promo')->findOrFail($id);

        return response()->json(['data' => $campaign]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $campaign = Campaign::findOrFail($id);

        $validated = $request->validate([
            'promo_id' => ['sometimes', 'required', 'integer', 'exists:promos,id'],
            'subject' => ['sometimes', 'required', 'string', 'max:255'],
            'email_body' => ['nullable', 'string'],
            'scheduled_at' => ['nullable', 'date'],
            'status' => ['nullable', 'in:draft,queued,sending,sent,failed,cancelled'],
        ]);

        $campaign->update($validated);
        $campaign->load('promo');

        return response()->json([
            'message' => 'Campaign updated successfully',
            'data' => $campaign,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $campaign = Campaign::findOrFail($id);
        $campaign->delete();

        return response()->json([
            'message' => 'Campaign deleted successfully',
        ]);
    }

    public function queue(int $id): JsonResponse
    {
        $campaign = Campaign::findOrFail($id);

        if (! in_array($campaign->status, ['draft', 'failed', 'cancelled'])) {
            return response()->json([
                'message' => 'Campaign cannot be queued in its current status',
            ], 422);
        }

        $subscriberCount = \App\Models\NewsletterSubscriber::subscribed()->count();

        $campaign->update([
            'status' => 'queued',
            'total_recipients' => $subscriberCount,
            'sent_count' => 0,
            'failed_count' => 0,
        ]);

        return response()->json([
            'message' => 'Campaign queued successfully',
            'data' => $campaign,
        ]);
    }
}
