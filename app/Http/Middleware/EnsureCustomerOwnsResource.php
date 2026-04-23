<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCustomerOwnsResource
{
    public function handle(Request $request, Closure $next, string $resourceType = 'customer'): Response
    {
        $customerId = $request->route('customer_id') ?? $request->route('id');

        if (! $customerId) {
            return response()->json(['message' => 'Customer ID required'], 400);
        }

        $authenticatedCustomer = $request->user();

        if (! $authenticatedCustomer) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ((string) $authenticatedCustomer->id !== (string) $customerId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
