<?php

namespace App\Http\Requests;

use App\Enums\DecisionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SimulateDecisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'decision_type' => ['required', Rule::enum(DecisionType::class)],
            'title' => ['required', 'string', 'max:255'],
            'parameters' => ['required', 'array'],
            'parameters.one_time_cost' => ['nullable', 'numeric', 'min:0'],
            'parameters.monthly_cost' => ['nullable', 'numeric'],
            'parameters.duration_months' => ['nullable', 'integer', 'min:1', 'max:600'],
            'parameters.loan_principal' => ['nullable', 'numeric', 'min:0'],
            'parameters.loan_months' => ['nullable', 'integer', 'min:1', 'max:600'],
            'parameters.loan_annual_rate' => ['nullable', 'numeric', 'min:0', 'max:1'],
        ];
    }
}
