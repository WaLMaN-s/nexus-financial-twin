<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\TwinEngineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TwinController extends Controller
{
    public function __construct(private readonly TwinEngineService $twinEngine) {}

    public function projection(Request $request): JsonResponse
    {
        return response()->json($this->twinEngine->project($request->user())->toArray());
    }
}
