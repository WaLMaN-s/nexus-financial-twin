<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HealthScoreSnapshot extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'score', 'components', 'computed_at'];

    protected function casts(): array
    {
        return [
            'score' => 'integer',
            'components' => 'array',
            'computed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
