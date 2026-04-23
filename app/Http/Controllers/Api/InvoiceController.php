<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaginatedResourceCollection;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;

class InvoiceController extends Controller
{
    public function index(): JsonResponse
    {
        $invoices = Invoice::with('order.customer')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json(new PaginatedResourceCollection($invoices));
    }

    public function show(string $id): JsonResponse
    {
        $invoice = Invoice::with(['order.customer', 'order.items.bouquet'])->find($id);

        if (! $invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        return response()->json(['data' => $invoice]);
    }
}
