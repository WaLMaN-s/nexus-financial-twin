<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\TimelineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimelineController extends Controller
{
    public function __construct(private readonly TimelineService $timeline) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->timeline->build($request->user()));
    }
}
