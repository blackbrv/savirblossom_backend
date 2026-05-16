<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaginatedResourceCollection;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterSubscriberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->get('per_page', 10), 50);
        $search = $request->input('search');
        $status = $request->input('status');

        $query = NewsletterSubscriber::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', '%'.$search.'%')
                    ->orWhere('name', 'like', '%'.$search.'%');
            });
        }

        if ($status === 'subscribed') {
            $query->where('is_subscribed', true);
        } elseif ($status === 'unsubscribed') {
            $query->where('is_subscribed', false);
        }

        $subscribers = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json(new PaginatedResourceCollection($subscribers));
    }

    public function show(int $id): JsonResponse
    {
        $subscriber = NewsletterSubscriber::findOrFail($id);

        return response()->json(['data' => $subscriber]);
    }

    public function toggle(int $id): JsonResponse
    {
        $subscriber = NewsletterSubscriber::findOrFail($id);
        $subscriber->is_subscribed = ! $subscriber->is_subscribed;
        $subscriber->unsubscribed_at = $subscriber->is_subscribed ? null : now();
        $subscriber->subscribed_at = $subscriber->is_subscribed ? now() : $subscriber->subscribed_at;
        $subscriber->save();

        return response()->json([
            'message' => 'Subscriber status updated',
            'data' => $subscriber,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $subscriber = NewsletterSubscriber::findOrFail($id);
        $subscriber->delete();

        return response()->json([
            'message' => 'Subscriber deleted successfully',
        ]);
    }
}
