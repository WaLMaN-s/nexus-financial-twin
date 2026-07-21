<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\LoginHistory;
use App\Models\User;
use App\Repositories\Contracts\AuditLogRepositoryInterface;
use App\Services\Security\TwoFactorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(
        private readonly TwoFactorService $twoFactor,
        private readonly AuditLogRepositoryInterface $auditLogs,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        $this->auditLogs->record($user->id, 'user.registered', 'user', $user->id, [], $request->ip());

        return response()->json([
            'user' => new UserResource($user),
            'token' => $user->createToken($request->deviceName())->plainTextToken,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            if ($user) {
                $this->recordLogin($request, $user, 'failed');
            }

            return response()->json(['message' => 'Invalid credentials.'], 422);
        }

        if ($user->hasTwoFactorEnabled()) {
            $code = $request->validated('two_factor_code');

            if (! $code) {
                $this->recordLogin($request, $user, '2fa_challenge');

                return response()->json(['two_factor_required' => true], 202);
            }

            if (! $this->twoFactor->verify($user, $code)) {
                $this->recordLogin($request, $user, 'failed');

                return response()->json(['message' => 'Invalid two-factor code.'], 422);
            }
        }

        $this->recordLogin($request, $user, 'success');
        $user->forceFill(['last_active_at' => now()])->save();

        return response()->json([
            'user' => new UserResource($user),
            'token' => $user->createToken($request->deviceName())->plainTextToken,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    private function recordLogin(Request $request, User $user, string $status): void
    {
        LoginHistory::create([
            'user_id' => $user->id,
            'ip_address' => (string) $request->ip(),
            'user_agent' => (string) $request->userAgent(),
            'device' => substr((string) $request->header('X-Device-Name', 'Unknown device'), 0, 100),
            'status' => $status,
            'created_at' => now(),
        ]);

        $this->auditLogs->record($user->id, "auth.login.$status", 'user', $user->id, [], $request->ip());
    }
}
