<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PasswordSetupController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $customer = Customer::where('email', $request->email)->first();

        if (! $customer) {
            return response()->json([
                'message' => 'Customer not found',
            ], 404);
        }

        if ($customer->password_set) {
            return response()->json([
                'message' => 'Password already set for this account',
            ], 400);
        }

        $token = Str::random(64);

        DB::table('password_setup_tokens')->updateOrInsert(
            ['email' => $customer->email],
            [
                'token' => bcrypt($token),
                'created_at' => now(),
            ]
        );

        $frontendUrl = config('app.frontend_url', env('APP_FRONTEND_URL', 'http://localhost:5173'));
        $setupUrl = "{$frontendUrl}/setup-password?token={$token}&email=".urlencode($customer->email);

        $customer->notify(new \App\Notifications\PasswordSetupNotification($setupUrl, $customer->username));

        return response()->json([
            'message' => 'Password setup email sent successfully',
        ]);
    }

    public function resend(string $customerId): JsonResponse
    {
        $customer = Customer::find($customerId);

        if (! $customer) {
            return response()->json([
                'message' => 'Customer not found',
            ], 404);
        }

        if ($customer->password_set) {
            return response()->json([
                'message' => 'Password already set for this account',
            ], 400);
        }

        $token = Str::random(64);

        DB::table('password_setup_tokens')->updateOrInsert(
            ['email' => $customer->email],
            [
                'token' => bcrypt($token),
                'created_at' => now(),
            ]
        );

        $frontendUrl = config('app.frontend_url', env('APP_FRONTEND_URL', 'http://localhost:5173'));
        $setupUrl = "{$frontendUrl}/setup-password?token={$token}&email=".urlencode($customer->email);

        $customer->notify(new \App\Notifications\PasswordSetupNotification($setupUrl, $customer->username));

        return response()->json([
            'message' => 'Password setup email sent successfully',
        ]);
    }
}
