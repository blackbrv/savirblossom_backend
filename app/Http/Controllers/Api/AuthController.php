<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GoogleAuthRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $customer = Customer::create([
            'email' => $request->email,
            'password' => $request->password,
            'username' => $request->username,
            'phone_number' => $request->phone_number,
            'provider' => 'email',
            'password_set' => true,
            'email_verified_at' => null,
        ]);

        $this->sendVerificationEmail($customer);

        return response()->json([
            'customer' => $customer,
            'message' => 'Registration successful. Please verify your email.',
        ], 201);
    }

    private function sendVerificationEmail(Customer $customer): void
    {
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
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $customer = Customer::where('email', $request->email)->first();

        if (! $customer || ! Hash::check($request->password, $customer->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $token = $customer->createToken('auth_token')->plainTextToken;

        return response()->json([
            'customer' => $customer,
            'token' => $token,
        ]);
    }

    public function googleRedirect(): JsonResponse
    {
        $url = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    public function googleCallback(GoogleAuthRequest $request): JsonResponse
    {
        $googleUser = Socialite::driver('google')->stateless()->userFromToken($request->google_token);

        $isNewUser = false;
        $customer = Customer::updateOrCreate(
            ['google_id' => $googleUser->id],
            function ($record) use ($googleUser, &$isNewUser) {
                if (! $record->exists) {
                    $isNewUser = true;
                    $record->email = $googleUser->email;
                    $record->username = $googleUser->name ?? $googleUser->email;
                    $record->profile_picture = $googleUser->avatar;
                    $record->provider = 'google';
                    $record->password_set = true;
                    $record->email_verified_at = now();
                }
            }
        );

        if (! $customer->email_verified_at) {
            $customer->email_verified_at = now();
            $customer->save();
        }

        if (! $customer->password_set) {
            $customer->password_set = true;
            $customer->save();
        }

        $token = $customer->createToken('auth_token')->plainTextToken;

        return response()->json([
            'customer' => $customer,
            'token' => $token,
        ]);
    }

    public function logout(): JsonResponse
    {
        $customer = request()->user();

        if ($customer) {
            $customer->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(): JsonResponse
    {
        return response()->json(['customer' => request()->user()]);
    }
}
