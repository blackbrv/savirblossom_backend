<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaginatedResourceCollection;
use App\Models\FeedbackQuestion;
use App\Models\FeedbackQuestionsTemplate;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FeedbackQuestionsTemplateController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min($request->get('per_page', 10), 50);
        $search = $request->input('search');

        $query = FeedbackQuestionsTemplate::withCount('questions');

        if ($search) {
            $query->where('name', 'like', '%'.$search.'%');
        }

        $templates = $query->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json(new PaginatedResourceCollection($templates));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_default' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (isset($validated['is_default']) && $validated['is_default']) {
            FeedbackQuestionsTemplate::where('is_default', true)
                ->update(['is_default' => false]);
        }

        $template = FeedbackQuestionsTemplate::create($validated);

        return response()->json([
            'message' => 'Template created successfully',
            'data' => $template->load('questions'),
        ], 201);
    }

    public function show(string $id)
    {
        try {
            $template = FeedbackQuestionsTemplate::with(['questions' => function ($query) {
                $query->orderBy('order');
            }])->findOrFail($id);

            return response()->json(['data' => $template]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Template not found'], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $template = FeedbackQuestionsTemplate::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Template not found'], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_default' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (isset($validated['is_default']) && $validated['is_default']) {
            FeedbackQuestionsTemplate::where('is_default', true)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);
        }

        $template->update($validated);

        return response()->json([
            'message' => 'Template updated successfully',
            'data' => $template->load('questions'),
        ]);
    }

    public function destroy(string $id)
    {
        try {
            $template = FeedbackQuestionsTemplate::findOrFail($id);

            if ($template->is_default) {
                return response()->json([
                    'message' => 'Cannot delete default template',
                ], 422);
            }

            $template->delete();

            return response()->json([
                'message' => 'Template deleted successfully',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Template not found'], 404);
        }
    }

    public function addQuestion(Request $request, string $id)
    {
        try {
            $template = FeedbackQuestionsTemplate::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Template not found'], 404);
        }

        $validated = $request->validate([
            'question_text' => ['required', 'string', 'max:255'],
            'question_type' => [
                'required',
                Rule::in(['star_rating', 'text', 'yes_no', 'yes_no_reason']),
            ],
            'is_required' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer'],
        ]);

        $maxOrder = $template->questions()->max('order') ?? -1;

        $question = $template->questions()->create([
            'question_text' => $validated['question_text'],
            'question_type' => $validated['question_type'],
            'is_required' => $validated['is_required'] ?? true,
            'order' => $validated['order'] ?? ($maxOrder + 1),
        ]);

        return response()->json([
            'message' => 'Question added successfully',
            'data' => $question,
        ], 201);
    }

    public function updateQuestion(Request $request, string $templateId, string $questionId)
    {
        try {
            $template = FeedbackQuestionsTemplate::findOrFail($templateId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Template not found'], 404);
        }

        try {
            $question = $template->questions()->findOrFail($questionId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Question not found'], 404);
        }

        $validated = $request->validate([
            'question_text' => ['sometimes', 'required', 'string', 'max:255'],
            'question_type' => [
                'sometimes',
                'required',
                Rule::in(['star_rating', 'text', 'yes_no', 'yes_no_reason']),
            ],
            'is_required' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer'],
        ]);

        $question->update($validated);

        return response()->json([
            'message' => 'Question updated successfully',
            'data' => $question,
        ]);
    }

    public function deleteQuestion(string $templateId, string $questionId)
    {
        try {
            $template = FeedbackQuestionsTemplate::findOrFail($templateId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Template not found'], 404);
        }

        try {
            $question = $template->questions()->findOrFail($questionId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Question not found'], 404);
        }

        $question->delete();

        return response()->json([
            'message' => 'Question deleted successfully',
        ]);
    }

    public function reorderQuestions(Request $request, string $id)
    {
        try {
            $template = FeedbackQuestionsTemplate::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Template not found'], 404);
        }

        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['required', 'integer', 'exists:feedback_questions,id'],
        ]);

        foreach ($validated['order'] as $index => $questionId) {
            FeedbackQuestion::where('id', $questionId)
                ->where('feedback_questions_template_id', $id)
                ->update(['order' => $index]);
        }

        return response()->json([
            'message' => 'Questions reordered successfully',
            'data' => $template->load('questions'),
        ]);
    }
}
