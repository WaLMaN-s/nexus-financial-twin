<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimulateDecisionRequest;
use App\Models\Simulation;
use App\Services\DecisionSimulatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SimulationController extends Controller
{
    public function __construct(private readonly DecisionSimulatorService $simulator) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->simulations()->latest()->limit(20)->get()
        );
    }

    public function store(SimulateDecisionRequest $request): JsonResponse
    {
        $simulation = $this->simulator->simulate(
            $request->user(),
            $request->validated('decision_type'),
            $request->validated('title'),
            $request->validated('parameters'),
        );

        return response()->json($simulation, 201);
    }

    public function show(Request $request, Simulation $simulation): JsonResponse
    {
        $this->authorize('view', $simulation);

        return response()->json($simulation);
    }
}
