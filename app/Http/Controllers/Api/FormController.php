<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaginatedResourceCollection;
use App\Models\Form;
use App\Models\FormQuestion;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FormController extends Controller
{
    private const VALID_TYPES = [
        'text', 'textarea', 'number', 'boolean', 'select', 'radio', 'checkbox',
        'email', 'phone', 'date',
    ];

    public function index(Request $request)
    {
        $perPage = min($request->get('per_page', 10), 50);
        $search = $request->input('search');

        $query = Form::withCount('questions');

        if ($search) {
            $query->where('name', 'like', '%'.$search.'%');
        }

        $forms = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json(new PaginatedResourceCollection($forms));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $form = Form::create($validated);

        return response()->json([
            'message' => 'Form created successfully',
            'data' => $form->load('questions'),
        ], 201);
    }

    public function show(string $id)
    {
        try {
            $form = Form::with(['questions' => function ($query) {
                $query->orderBy('order');
            }, 'questions.options'])->findOrFail($id);

            return response()->json(['data' => $form]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Form not found'], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $form = Form::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Form not found'], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $form->update($validated);

        return response()->json([
            'message' => 'Form updated successfully',
            'data' => $form->load(['questions', 'questions.options']),
        ]);
    }

    public function destroy(string $id)
    {
        try {
            $form = Form::findOrFail($id);
            $form->delete();

            return response()->json([
                'message' => 'Form deleted successfully',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Form not found'], 404);
        }
    }

    public function addQuestion(Request $request, string $id)
    {
        try {
            $form = Form::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Form not found'], 404);
        }

        $validated = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'question_type' => ['required', Rule::in(self::VALID_TYPES)],
            'is_required' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer'],
            'config' => ['nullable', 'array'],
        ]);

        $maxOrder = $form->questions()->max('order') ?? -1;

        $question = $form->questions()->create([
            'label' => $validated['label'],
            'question_type' => $validated['question_type'],
            'is_required' => $validated['is_required'] ?? false,
            'order' => $validated['order'] ?? ($maxOrder + 1),
            'config' => $validated['config'] ?? null,
        ]);

        if ($request->has('options')) {
            $request->validate([
                'options' => ['nullable', 'array'],
                'options.*.label' => ['required_with:options', 'string', 'max:255'],
                'options.*.value' => ['nullable', 'string', 'max:255'],
            ]);

            foreach ($request->input('options', []) as $index => $option) {
                $question->options()->create([
                    'label' => $option['label'],
                    'value' => $option['value'] ?? null,
                    'order' => $index,
                ]);
            }
        }

        $question->load('options');

        return response()->json([
            'message' => 'Question added successfully',
            'data' => $question,
        ], 201);
    }

    public function updateQuestion(Request $request, string $formId, string $questionId)
    {
        try {
            $form = Form::findOrFail($formId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Form not found'], 404);
        }

        try {
            $question = $form->questions()->findOrFail($questionId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Question not found'], 404);
        }

        $validated = $request->validate([
            'label' => ['sometimes', 'required', 'string', 'max:255'],
            'question_type' => ['sometimes', 'required', Rule::in(self::VALID_TYPES)],
            'is_required' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer'],
            'config' => ['nullable', 'array'],
        ]);

        $question->update($validated);

        if ($request->has('options')) {
            $request->validate([
                'options' => ['nullable', 'array'],
                'options.*.label' => ['required_with:options', 'string', 'max:255'],
                'options.*.value' => ['nullable', 'string', 'max:255'],
            ]);

            $question->options()->delete();

            foreach ($request->input('options', []) as $index => $option) {
                $question->options()->create([
                    'label' => $option['label'],
                    'value' => $option['value'] ?? null,
                    'order' => $index,
                ]);
            }
        }

        $question->load('options');

        return response()->json([
            'message' => 'Question updated successfully',
            'data' => $question,
        ]);
    }

    public function deleteQuestion(string $formId, string $questionId)
    {
        try {
            $form = Form::findOrFail($formId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Form not found'], 404);
        }

        try {
            $question = $form->questions()->findOrFail($questionId);
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
            $form = Form::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Form not found'], 404);
        }

        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['required', 'integer', 'exists:form_questions,id'],
        ]);

        foreach ($validated['order'] as $index => $questionId) {
            FormQuestion::where('id', $questionId)
                ->where('form_id', $id)
                ->update(['order' => $index]);
        }

        return response()->json([
            'message' => 'Questions reordered successfully',
            'data' => $form->load(['questions', 'questions.options']),
        ]);
    }
}
