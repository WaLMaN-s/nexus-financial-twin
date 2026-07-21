<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\AccountType;
use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Repositories\Contracts\AccountRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AccountController extends Controller
{
    public function __construct(private readonly AccountRepositoryInterface $accounts) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'accounts' => $this->accounts->forUser($request->user()->id),
            'total_assets' => $this->accounts->totalAssets($request->user()->id),
            'total_liabilities' => $this->accounts->totalLiabilities($request->user()->id),
            'net_worth' => $this->accounts->netWorth($request->user()->id),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::enum(AccountType::class)],
            'balance' => ['required', 'numeric'],
            'interest_rate' => ['nullable', 'numeric', 'between:0,100'],
        ]);

        return response()->json(
            Account::create([...$validated, 'user_id' => $request->user()->id]),
            201,
        );
    }
}
