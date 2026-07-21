<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AdvisorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdvisorController extends Controller
{
    public function __construct(private readonly AdvisorService $advisor) {}

    public function ask(Request $request): JsonResponse
    {
        $request->validate(['message' => ['required', 'string', 'max:1000']]);

        return response()->json(
            $this->advisor->ask($request->user(), $request->input('message'))
        );
    }
}
