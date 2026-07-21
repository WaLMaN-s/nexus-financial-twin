<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $subscriptions = $request->user()->subscriptions()->orderBy('name')->get();

        return response()->json([
            'subscriptions' => $subscriptions,
            'monthly_total' => round($subscriptions->where('status', 'active')->sum(fn ($s) => $s->monthlyCost()), 2),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:40'],
            'amount' => ['required', 'numeric', 'min:0'],
            'billing_cycle' => ['required', 'in:monthly,yearly'],
            'last_used_at' => ['nullable', 'date'],
        ]);

        return response()->json(
            Subscription::create([...$validated, 'user_id' => $request->user()->id]),
            201,
        );
    }
}
