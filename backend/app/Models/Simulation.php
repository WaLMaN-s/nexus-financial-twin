<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Simulation extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'decision_type', 'title', 'parameters', 'result'];

    protected function casts(): array
    {
        return [
            'parameters' => 'array',
            'result' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
