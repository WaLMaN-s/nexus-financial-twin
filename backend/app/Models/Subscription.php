<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'category', 'amount',
        'billing_cycle', 'last_used_at', 'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'last_used_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function monthlyCost(): float
    {
        return $this->billing_cycle === 'yearly' ? $this->amount / 12 : $this->amount;
    }
}
