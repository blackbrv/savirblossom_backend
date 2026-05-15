<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaginatedResourceCollection;
use App\Models\Form;
use App\Models\FormSubmission;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FormSubmissionController extends Controller
{
    public function index(Request $request, string $formId)
    {
        try {
            $form = Form::findOrFail($formId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Form not found'], 404);
        }

        $perPage = min($request->get('per_page', 10), 50);

        $submissions = $form->submissions()
            ->with(['customer', 'answers.question'])
            ->orderBy('submitted_at', 'desc')
            ->paginate($perPage);

        return response()->json(new PaginatedResourceCollection($submissions));
    }

    public function show(string $id)
    {
        try {
            $submission = FormSubmission::with(['form', 'customer', 'answers.question'])
                ->findOrFail($id);

            return response()->json(['data' => $submission]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Submission not found'], 404);
        }
    }

    public function submit(Request $request, string $formId)
    {
        try {
            $form = Form::with('questions')->findOrFail($formId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Form not found'], 404);
        }

        if (! $form->is_active) {
            return response()->json(['message' => 'Form is not active'], 422);
        }

        $validated = $request->validate([
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer', 'exists:form_questions,id'],
            'answers.*.value' => ['nullable', 'string'],
        ]);

        $questionIds = $form->questions->pluck('id')->toArray();

        foreach ($validated['answers'] as $answer) {
            if (! in_array($answer['question_id'], $questionIds)) {
                return response()->json([
                    'message' => 'Question #'.$answer['question_id'].' does not belong to this form',
                ], 422);
            }
        }

        try {
            $submission = DB::transaction(function () use ($form, $validated) {
                $submission = $form->submissions()->create([
                    'customer_id' => $validated['customer_id'] ?? null,
                    'submitted_at' => now(),
                ]);

                foreach ($validated['answers'] as $answer) {
                    $submission->answers()->create([
                        'form_question_id' => $answer['question_id'],
                        'value' => $answer['value'] ?? null,
                    ]);
                }

                return $submission;
            });

            $submission->load(['customer', 'answers.question']);

            return response()->json([
                'message' => 'Form submitted successfully',
                'data' => $submission,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to submit form'], 500);
        }
    }
}
