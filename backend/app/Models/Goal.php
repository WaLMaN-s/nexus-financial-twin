<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Goal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'type', 'icon', 'target_amount',
        'current_amount', 'monthly_contribution', 'target_date', 'status',
    ];

    protected function casts(): array
    {
        return [
            'target_amount' => 'float',
            'current_amount' => 'float',
            'monthly_contribution' => 'float',
            'target_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function progress(): float
    {
        return $this->target_amount > 0
            ? min(1.0, $this->current_amount / $this->target_amount)
            : 0.0;
    }
}
