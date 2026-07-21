<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\AuditLogRepositoryInterface;
use App\Services\Security\TwoFactorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TwoFactorController extends Controller
{
    public function __construct(
        private readonly TwoFactorService $twoFactor,
        private readonly AuditLogRepositoryInterface $auditLogs,
    ) {}

    public function initiate(Request $request): JsonResponse
    {
        return response()->json($this->twoFactor->initiate($request->user()));
    }

    public function confirm(Request $request): JsonResponse
    {
        $request->validate(['code' => ['required', 'string', 'max:20']]);

        $result = $this->twoFactor->confirm($request->user(), $request->input('code'));

        if (! $result['enabled']) {
            return response()->json(['message' => 'Invalid verification code.'], 422);
        }

        $this->auditLogs->record($request->user()->id, 'security.2fa.enabled', 'user', $request->user()->id, [], $request->ip());

        return response()->json($result);
    }

    public function disable(Request $request): JsonResponse
    {
        $this->twoFactor->disable($request->user());
        $this->auditLogs->record($request->user()->id, 'security.2fa.disabled', 'user', $request->user()->id, [], $request->ip());

        return response()->json(['message' => 'Two-factor authentication disabled.']);
    }
}
