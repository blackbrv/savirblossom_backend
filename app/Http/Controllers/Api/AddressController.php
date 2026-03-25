<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\Customer;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(string $customerId): JsonResponse
    {
        try {
            $customer = Customer::findOrFail($customerId);
            $addresses = $customer->addresses()->orderBy('is_default', 'desc')->get();

            return response()->json(['data' => $addresses]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => "Customer {$customerId} not found"], 404);
        }
    }

    public function store(Request $request, string $customerId): JsonResponse
    {
        $request->validate([
            'label' => ['nullable', 'string', 'max:255'],
            'recipient_name' => ['required', 'string', 'max:255'],
            'phone_number' => ['required', 'string', 'max:20'],
            'address_line1' => ['required', 'string', 'max:500'],
            'address_line2' => ['nullable', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:20'],
            'country' => ['required', 'string', 'max:255'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        try {
            $customer = Customer::findOrFail($customerId);

            if ($request->boolean('is_default')) {
                $customer->addresses()->update(['is_default' => false]);
            }

            $address = $customer->addresses()->create([
                'label' => $request->label,
                'recipient_name' => $request->recipient_name,
                'phone_number' => $request->phone_number,
                'address_line1' => $request->address_line1,
                'address_line2' => $request->address_line2,
                'city' => $request->city,
                'state' => $request->state,
                'postal_code' => $request->postal_code,
                'country' => $request->country,
                'is_default' => $request->boolean('is_default'),
            ]);

            return response()->json(['data' => $address], 201);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => "Customer {$customerId} not found"], 404);
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'label' => ['nullable', 'string', 'max:255'],
            'recipient_name' => ['required', 'string', 'max:255'],
            'phone_number' => ['required', 'string', 'max:20'],
            'address_line1' => ['required', 'string', 'max:500'],
            'address_line2' => ['nullable', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:20'],
            'country' => ['required', 'string', 'max:255'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        try {
            $address = Address::findOrFail($id);

            if ($request->boolean('is_default')) {
                $address->customer->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
            }

            $address->update([
                'label' => $request->label,
                'recipient_name' => $request->recipient_name,
                'phone_number' => $request->phone_number,
                'address_line1' => $request->address_line1,
                'address_line2' => $request->address_line2,
                'city' => $request->city,
                'state' => $request->state,
                'postal_code' => $request->postal_code,
                'country' => $request->country,
                'is_default' => $request->boolean('is_default'),
            ]);

            return response()->json(['data' => $address]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => "Address {$id} not found"], 404);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $address = Address::findOrFail($id);
            $address->delete();

            return response()->json(['message' => 'Address deleted successfully']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => "Address {$id} not found"], 404);
        }
    }

    public function setDefault(Request $request, string $id): JsonResponse
    {
        try {
            $address = Address::findOrFail($id);

            $address->customer->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);

            $address->is_default = true;
            $address->save();

            return response()->json(['data' => $address]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => "Address {$id} not found"], 404);
        }
    }
}
