<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\BehaviorAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InsightController extends Controller
{
    public function __construct(private readonly BehaviorAnalyticsService $analytics) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'insights' => $this->analytics->analyze($request->user()),
            'trends' => $this->analytics->trends($request->user()),
        ]);
    }
}
