<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGoalRequest;
use App\Http\Requests\UpdateGoalRequest;
use App\Models\Goal;
use App\Repositories\Contracts\GoalRepositoryInterface;
use App\Services\GoalIntelligenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function __construct(
        private readonly GoalRepositoryInterface $goals,
        private readonly GoalIntelligenceService $intelligence,
    ) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->intelligence->forecastAll($request->user()));
    }

    public function store(StoreGoalRequest $request): JsonResponse
    {
        $goal = $this->goals->create($request->user()->id, $request->validated());

        return response()->json($goal, 201);
    }

    public function update(UpdateGoalRequest $request, Goal $goal): JsonResponse
    {
        $this->authorize('update', $goal);

        return response()->json($this->goals->update($goal, $request->validated()));
    }

    public function destroy(Request $request, Goal $goal): JsonResponse
    {
        $this->authorize('delete', $goal);

        $this->goals->delete($goal);

        return response()->json(['message' => 'Goal deleted.']);
    }
}
