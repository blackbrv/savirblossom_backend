<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
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

        return response()->json($customers);
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
