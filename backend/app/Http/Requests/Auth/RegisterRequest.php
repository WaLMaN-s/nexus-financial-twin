<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::min(8)->letters()->numbers()],
            'monthly_income' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'birth_year' => ['nullable', 'integer', 'between:1920,2015'],
            'occupation' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function deviceName(): string
    {
        return substr((string) $this->header('X-Device-Name', 'web'), 0, 100);
    }
}
