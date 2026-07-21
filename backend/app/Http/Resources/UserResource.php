<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'currency' => $this->currency,
            'birth_year' => $this->birth_year,
            'monthly_income' => (float) $this->monthly_income,
            'occupation' => $this->occupation,
            'two_factor_enabled' => $this->hasTwoFactorEnabled(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
