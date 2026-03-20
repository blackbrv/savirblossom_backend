<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['sometimes', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'profile_picture' => ['nullable', 'string', 'url'],
        ];
    }
}
