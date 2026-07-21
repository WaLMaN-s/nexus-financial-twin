<?php

namespace App\Repositories\Eloquent;

use App\Models\AuditLog;
use App\Repositories\Contracts\AuditLogRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentAuditLogRepository implements AuditLogRepositoryInterface
{
    public function record(
        ?int $userId,
        string $action,
        ?string $entityType = null,
        ?int $entityId = null,
        array $metadata = [],
        ?string $ipAddress = null,
    ): AuditLog {
        return AuditLog::create([
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'metadata' => $metadata ?: null,
            'ip_address' => $ipAddress,
            'created_at' => now(),
        ]);
    }

    public function forUser(int $userId, int $perPage = 20): LengthAwarePaginator
    {
        return AuditLog::query()
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function latest(int $perPage = 50): LengthAwarePaginator
    {
        return AuditLog::query()
            ->with('user:id,name,email')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
