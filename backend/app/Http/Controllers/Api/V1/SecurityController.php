<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\AuditLogRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SecurityController extends Controller
{
    public function __construct(private readonly AuditLogRepositoryInterface $auditLogs) {}

    /** Active devices = active Sanctum tokens. */
    public function sessions(Request $request): JsonResponse
    {
        $currentId = $request->user()->currentAccessToken()->id;

        return response()->json(
            $request->user()->tokens()->orderByDesc('last_used_at')->get()
                ->map(fn ($token) => [
                    'id' => $token->id,
                    'device' => $token->name,
                    'last_used_at' => $token->last_used_at?->toIso8601String(),
                    'created_at' => $token->created_at->toIso8601String(),
                    'is_current' => $token->id === $currentId,
                ])
        );
    }

    public function revokeSession(Request $request, int $tokenId): JsonResponse
    {
        $request->user()->tokens()->where('id', $tokenId)->delete();

        $this->auditLogs->record(
            $request->user()->id, 'security.session.revoked', 'token', $tokenId, [], $request->ip(),
        );

        return response()->json(['message' => 'Session revoked.']);
    }

    public function loginHistory(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->loginHistories()
                ->orderByDesc('created_at')
                ->limit(50)
                ->get()
        );
    }

    public function auditLogs(Request $request): JsonResponse
    {
        return response()->json($this->auditLogs->forUser($request->user()->id));
    }
}
