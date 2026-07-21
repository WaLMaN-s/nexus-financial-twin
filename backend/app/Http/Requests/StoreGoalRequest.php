<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:house,car,wedding,emergency_fund,vacation,investment,custom'],
            'icon' => ['nullable', 'string', 'max:40'],
            'target_amount' => ['required', 'numeric', 'min:1'],
            'current_amount' => ['nullable', 'numeric', 'min:0'],
            'monthly_contribution' => ['nullable', 'numeric', 'min:0'],
            'target_date' => ['required', 'date', 'after:today'],
        ];
    }
}
