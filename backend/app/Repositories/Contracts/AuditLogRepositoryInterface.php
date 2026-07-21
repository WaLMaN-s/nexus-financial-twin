<?php

namespace App\Repositories\Contracts;

use App\Models\AuditLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AuditLogRepositoryInterface
{
    public function record(
        ?int $userId,
        string $action,
        ?string $entityType = null,
        ?int $entityId = null,
        array $metadata = [],
        ?string $ipAddress = null,
    ): AuditLog;

    public function forUser(int $userId, int $perPage = 20): LengthAwarePaginator;

    public function latest(int $perPage = 50): LengthAwarePaginator;
}
