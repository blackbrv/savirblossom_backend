<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $existing = NewsletterSubscriber::where('email', $validated['email'])->first();

        if ($existing) {
            if ($existing->is_subscribed) {
                return response()->json([
                    'message' => 'Already subscribed',
                    'data' => $existing,
                ]);
            }

            $existing->update([
                'is_subscribed' => true,
                'subscribed_at' => now(),
                'unsubscribed_at' => null,
                'name' => $validated['name'] ?? $existing->name,
            ]);

            return response()->json([
                'message' => 'Successfully re-subscribed',
                'data' => $existing,
            ]);
        }

        $subscriber = NewsletterSubscriber::create([
            'email' => $validated['email'],
            'name' => $validated['name'] ?? null,
        ]);

        return response()->json([
            'message' => 'Successfully subscribed',
            'data' => $subscriber,
        ], 201);
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $subscriber = NewsletterSubscriber::where('unsubscribe_token', $validated['token'])
            ->where('is_subscribed', true)
            ->first();

        if (! $subscriber) {
            return response()->json([
                'message' => 'Invalid or expired unsubscribe token',
            ], 404);
        }

        $subscriber->update([
            'is_subscribed' => false,
            'unsubscribed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Successfully unsubscribed',
        ]);
    }

    public function unsubscribeByEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $subscriber = NewsletterSubscriber::where('email', $validated['email'])
            ->where('is_subscribed', true)
            ->first();

        if (! $subscriber) {
            return response()->json([
                'message' => 'Subscriber not found',
            ], 404);
        }

        $subscriber->update([
            'is_subscribed' => false,
            'unsubscribed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Successfully unsubscribed',
        ]);
    }
}
