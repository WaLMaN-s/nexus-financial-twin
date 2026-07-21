<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'two_factor_code' => ['nullable', 'string', 'max:20'],
        ];
    }

    public function deviceName(): string
    {
        return substr((string) $this->header('X-Device-Name', 'web'), 0, 100);
    }
}
