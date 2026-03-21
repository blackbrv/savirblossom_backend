<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\PaginatedResourceCollection;
use App\Models\Customer;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CustomerController extends Controller
{
    public function store(CreateCustomerRequest $request): JsonResponse
    {
        $customer = Customer::create([
            'email' => $request->email,
            'username' => $request->username,
            'phone_number' => $request->phone_number,
            'profile_picture' => $request->profile_picture,
            'provider' => 'email',
            'password_set' => false,
        ]);

        $token = Str::random(64);

        DB::table('password_setup_tokens')->updateOrInsert(
            ['email' => $customer->email],
            [
                'token' => bcrypt($token),
                'created_at' => now(),
            ]
        );

        $frontendUrl = config('app.frontend_url', env('APP_FRONTEND_URL', 'http://localhost:5173'));
        $setupUrl = "{$frontendUrl}/reset-password?token={$token}&email=" . urlencode($customer->email);

        $customer->notify(new \App\Notifications\PasswordSetupNotification($setupUrl, $customer->username));

        return response()->json(['data' => $customer], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 15), 50);
        $search = $request->input('search');
        $provider = $request->input('provider');

        $query = Customer::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($provider) {
            $query->where('provider', $provider);
        }

        $customers = $query->paginate($perPage);

        return response()->json(new PaginatedResourceCollection($customers));
    }

    public function show(string $id): JsonResponse
    {
        try {
            $customer = Customer::findOrFail($id);

            return response()->json(['data' => $customer]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => "Customer {$id} not found"], 404);
        }
    }

    public function update(UpdateCustomerRequest $request, string $id): JsonResponse
    {
        try {
            $customer = Customer::findOrFail($id);
            $customer->update($request->validated());

            return response()->json(['data' => $customer]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => "Customer {$id} not found"], 404);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $customer = Customer::findOrFail($id);
            $customer->delete();

            return response()->json(['message' => "Customer {$id} deleted successfully"]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => "Customer {$id} not found"], 404);
        }
    }
}
