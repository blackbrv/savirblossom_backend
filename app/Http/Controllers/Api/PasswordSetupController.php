<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordSetupController extends Controller
{
    public function sendSetup(Request $request): JsonResponse
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
                'message' => 'Password already set for this account. Use forgot password instead.',
            ], 400);
        }

        $token = Str::random(64);

        DB::table('password_setup_tokens')->updateOrInsert(
            ['email' => $customer->email],
            [
                'token' => bcrypt($token),
                'type' => 'setup',
                'created_at' => now(),
            ]
        );

        $frontendUrl = config('app.frontend_url', env('APP_FRONTEND_URL', 'http://localhost:5173'));
        $setupUrl = "{$frontendUrl}/reset-password?token={$token}&email=".urlencode($customer->email);

        $customer->notify(new \App\Notifications\PasswordSetupNotification($setupUrl, $customer->username));

        return response()->json([
            'message' => 'Password setup email sent successfully',
        ]);
    }

    public function sendReset(Request $request): JsonResponse
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

        if (! $customer->password_set) {
            return response()->json([
                'message' => 'Password not set for this account. Use password setup instead.',
            ], 400);
        }

        $token = Str::random(64);

        DB::table('password_setup_tokens')->updateOrInsert(
            ['email' => $customer->email],
            [
                'token' => bcrypt($token),
                'type' => 'reset',
                'created_at' => now(),
            ]
        );

        $frontendUrl = config('app.frontend_url', env('APP_FRONTEND_URL', 'http://localhost:5173'));
        $resetUrl = "{$frontendUrl}/reset-password?token={$token}&email=".urlencode($customer->email);

        $customer->notify(new \App\Notifications\PasswordSetupNotification($resetUrl, $customer->username));

        return response()->json([
            'message' => 'Password reset email sent successfully',
        ]);
    }

    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $tokenRecord = DB::table('password_setup_tokens')
            ->where('email', $request->email)
            ->first();

        if (! $tokenRecord) {
            return response()->json([
                'message' => 'Invalid token',
            ], 400);
        }

        if (! Hash::check($request->token, $tokenRecord->token)) {
            return response()->json([
                'message' => 'Invalid token',
            ], 400);
        }

        $tokenCreatedAt = \Carbon\Carbon::parse($tokenRecord->created_at);
        if ($tokenCreatedAt->addHours(24)->isPast()) {
            DB::table('password_setup_tokens')->where('email', $request->email)->delete();

            return response()->json([
                'message' => 'Token has expired',
            ], 400);
        }

        $customer = Customer::where('email', $request->email)->first();

        if (! $customer) {
            return response()->json([
                'message' => 'Customer not found',
            ], 404);
        }

        $customer->password = $request->password;
        $customer->password_set = true;
        $customer->save();

        DB::table('password_setup_tokens')->where('email', $request->email)->delete();

        $authToken = $customer->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Password set successfully',
            'customer' => $customer,
            'token' => $authToken,
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
                'type' => 'setup',
                'created_at' => now(),
            ]
        );

        $frontendUrl = config('app.frontend_url', env('APP_FRONTEND_URL', 'http://localhost:5173'));
        $setupUrl = "{$frontendUrl}/reset-password?token={$token}&email=".urlencode($customer->email);

        $customer->notify(new \App\Notifications\PasswordSetupNotification($setupUrl, $customer->username));

        return response()->json([
            'message' => 'Password setup email sent successfully',
        ]);
    }

    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
        ]);

        $tokenRecord = DB::table('password_setup_tokens')
            ->where('email', $request->email)
            ->where('type', 'verification')
            ->first();

        if (! $tokenRecord) {
            return response()->json([
                'message' => 'Invalid verification token',
            ], 400);
        }

        if (! Hash::check($request->token, $tokenRecord->token)) {
            return response()->json([
                'message' => 'Invalid verification token',
            ], 400);
        }

        $tokenCreatedAt = \Carbon\Carbon::parse($tokenRecord->created_at);
        if ($tokenCreatedAt->addHours(24)->isPast()) {
            DB::table('password_setup_tokens')
                ->where('email', $request->email)
                ->where('type', 'verification')
                ->delete();

            return response()->json([
                'message' => 'Verification token has expired',
            ], 400);
        }

        $customer = Customer::where('email', $request->email)->first();

        if (! $customer) {
            return response()->json([
                'message' => 'Customer not found',
            ], 404);
        }

        if ($customer->email_verified_at) {
            return response()->json([
                'message' => 'Email already verified',
                'customer' => $customer,
            ], 400);
        }

        $customer->email_verified_at = now();
        $customer->save();

        DB::table('password_setup_tokens')
            ->where('email', $request->email)
            ->where('type', 'verification')
            ->delete();

        $authToken = $customer->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully',
            'customer' => $customer,
            'token' => $authToken,
        ]);
    }

    public function resendVerification(Request $request): JsonResponse
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

        if ($customer->email_verified_at) {
            return response()->json([
                'message' => 'Email already verified',
            ], 400);
        }

        $token = Str::random(64);

        DB::table('password_setup_tokens')->updateOrInsert(
            ['email' => $customer->email],
            [
                'token' => bcrypt($token),
                'type' => 'verification',
                'created_at' => now(),
            ]
        );

        $frontendUrl = config('app.frontend_url', env('APP_FRONTEND_URL', 'http://localhost:3000'));
        $verificationUrl = "{$frontendUrl}/verify-email?token={$token}&email=".urlencode($customer->email);

        $customer->notify(new \App\Notifications\EmailVerificationNotification($verificationUrl, $customer->username));

        return response()->json([
            'message' => 'Verification email sent successfully',
        ]);
    }
}
