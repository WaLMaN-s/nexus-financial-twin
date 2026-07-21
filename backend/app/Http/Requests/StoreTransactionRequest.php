<?php

namespace App\Http\Requests;

use App\Enums\TransactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => [
                'nullable',
                Rule::exists('accounts', 'id')->where('user_id', $this->user()->id),
            ],
            'type' => ['required', Rule::enum(TransactionType::class)],
            'category' => ['required', 'string', 'max:40'],
            'description' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'occurred_at' => ['required', 'date'],
            'is_recurring' => ['nullable', 'boolean'],
        ];
    }
}
