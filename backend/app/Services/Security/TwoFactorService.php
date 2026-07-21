<?php

namespace App\Services\Security;

use App\Models\User;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorService
{
    public function __construct(private readonly Google2FA $engine) {}

    /** Generate (but do not yet enable) a secret; returns the otpauth URL for QR rendering. */
    public function initiate(User $user): array
    {
        $secret = $this->engine->generateSecretKey();

        $user->forceFill(['two_factor_secret' => $secret])->save();

        return [
            'secret' => $secret,
            'otpauth_url' => $this->engine->getQRCodeUrl(
                'NEXUS Financial Twin',
                $user->email,
                $secret,
            ),
        ];
    }

    /** Confirm the first TOTP code and switch 2FA on. */
    public function confirm(User $user, string $code): array
    {
        if (! $user->two_factor_secret || ! $this->verify($user, $code)) {
            return ['enabled' => false, 'recovery_codes' => []];
        }

        $recoveryCodes = collect(range(1, 8))
            ->map(fn () => Str::upper(Str::random(5)).'-'.Str::upper(Str::random(5)))
            ->all();

        $user->forceFill([
            'two_factor_enabled_at' => now(),
            'two_factor_recovery_codes' => $recoveryCodes,
        ])->save();

        return ['enabled' => true, 'recovery_codes' => $recoveryCodes];
    }

    public function verify(User $user, string $code): bool
    {
        if (! $user->two_factor_secret) {
            return false;
        }

        if ($this->engine->verifyKey($user->two_factor_secret, $code)) {
            return true;
        }

        // Fall back to one-time recovery codes.
        $codes = $user->two_factor_recovery_codes ?? [];
        if (in_array($code, $codes, true)) {
            $user->forceFill([
                'two_factor_recovery_codes' => array_values(array_diff($codes, [$code])),
            ])->save();

            return true;
        }

        return false;
    }

    public function disable(User $user): void
    {
        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_enabled_at' => null,
        ])->save();
    }
}
