<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'in:house,car,wedding,emergency_fund,vacation,investment,custom'],
            'icon' => ['nullable', 'string', 'max:40'],
            'target_amount' => ['sometimes', 'numeric', 'min:1'],
            'current_amount' => ['sometimes', 'numeric', 'min:0'],
            'monthly_contribution' => ['sometimes', 'numeric', 'min:0'],
            'target_date' => ['sometimes', 'date'],
            'status' => ['sometimes', 'in:active,achieved,paused'],
        ];
    }
}
