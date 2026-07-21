<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function __construct(private readonly TransactionRepositoryInterface $transactions) {}

    public function index(Request $request): JsonResponse
    {
        $from = $request->query('from', now()->subMonths(3)->toDateString());
        $to = $request->query('to', now()->toDateString());

        return response()->json(
            $this->transactions->forUserBetween($request->user()->id, $from, $to)
        );
    }

    public function store(StoreTransactionRequest $request): JsonResponse
    {
        return response()->json(
            $this->transactions->create($request->user()->id, $request->validated()),
            201,
        );
    }
}
