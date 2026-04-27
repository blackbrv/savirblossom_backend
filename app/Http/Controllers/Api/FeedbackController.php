<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaginatedResourceCollection;
use App\Models\FeedbackAnswer;
use App\Models\FeedbackResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min($request->get('per_page', 10), 50);
        $orderId = $request->input('order_id');
        $bouquetId = $request->input('bouquet_id');
        $customerId = $request->input('customer_id');

        $query = FeedbackResponse::with(['customer', 'order', 'bouquet', 'answers.question']);

        if ($orderId) {
            $query->where('order_id', $orderId);
        }

        if ($bouquetId) {
            $query->where('bouquet_id', $bouquetId);
        }

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        $responses = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $responses->getCollection()->transform(function ($response) {
            $response->average_rating = $response->average_rating;

            return $response;
        });

        return response()->json(new PaginatedResourceCollection($responses));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'order_id' => 'nullable|exists:orders,id',
            'bouquet_id' => 'nullable|exists:bouquets,id',
            'answers' => 'required|array|min:1',
            'answers.*.question_id' => 'required|exists:feedback_questions,id',
            'answers.*.rating_value' => 'nullable|integer|min:1|max:5',
            'answers.*.text_value' => 'nullable|string',
            'answers.*.boolean_value' => 'nullable|boolean',
            'answers.*.reason_value' => 'nullable|string',
        ]);

        $response = FeedbackResponse::create([
            'customer_id' => $validated['customer_id'] ?? null,
            'order_id' => $validated['order_id'] ?? null,
            'bouquet_id' => $validated['bouquet_id'] ?? null,
        ]);

        foreach ($validated['answers'] as $answerData) {
            FeedbackAnswer::create([
                'feedback_response_id' => $response->id,
                'feedback_question_id' => $answerData['question_id'],
                'rating_value' => $answerData['rating_value'] ?? null,
                'text_value' => $answerData['text_value'] ?? null,
                'boolean_value' => $answerData['boolean_value'] ?? null,
                'reason_value' => $answerData['reason_value'] ?? null,
            ]);
        }

        return response()->json([
            'message' => 'Feedback submitted successfully',
            'data' => $response->load(['customer', 'order', 'bouquet', 'answers.question']),
        ], 201);
    }

    public function show(string $id)
    {
        try {
            $response = FeedbackResponse::with([
                'customer',
                'order',
                'bouquet',
                'answers.question',
            ])->findOrFail($id);

            $response->average_rating = $response->average_rating;

            return response()->json(['data' => $response]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Feedback not found'], 404);
        }
    }

    public function destroy(string $id)
    {
        try {
            $response = FeedbackResponse::findOrFail($id);
            $response->delete();

            return response()->json([
                'message' => 'Feedback deleted successfully',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Feedback not found'], 404);
        }
    }
}
