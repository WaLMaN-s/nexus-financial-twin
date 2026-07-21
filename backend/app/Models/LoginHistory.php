<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginHistory extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['user_id', 'ip_address', 'user_agent', 'device', 'status', 'created_at'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
