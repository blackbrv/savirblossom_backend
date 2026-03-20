<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GoogleAuthRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
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
        ]);

        $token = $customer->createToken('auth_token')->plainTextToken;

        return response()->json([
            'customer' => $customer,
            'token' => $token,
        ], 201);
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

        $customer = Customer::updateOrCreate(
            ['google_id' => $googleUser->id],
            [
                'email' => $googleUser->email,
                'username' => $googleUser->name ?? $googleUser->email,
                'profile_picture' => $googleUser->avatar,
                'provider' => 'google',
            ]
        );

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
