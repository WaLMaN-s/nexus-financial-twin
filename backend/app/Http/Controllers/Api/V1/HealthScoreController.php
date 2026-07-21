<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\HealthScoreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HealthScoreController extends Controller
{
    public function __construct(private readonly HealthScoreService $healthScore) {}

    public function show(Request $request): JsonResponse
    {
        return response()->json(
            $this->healthScore->computeAndStore($request->user())->toArray()
        );
    }

    public function history(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->healthScoreSnapshots()
                ->orderBy('computed_at')
                ->limit(52)
                ->get(['score', 'computed_at'])
        );
    }
}
