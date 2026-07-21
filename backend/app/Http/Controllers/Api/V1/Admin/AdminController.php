<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\AuditLogRepositoryInterface;
use App\Services\Admin\AdminAnalyticsService;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    public function __construct(
        private readonly AdminAnalyticsService $analytics,
        private readonly AuditLogRepositoryInterface $auditLogs,
    ) {}

    public function overview(): JsonResponse
    {
        return response()->json([
            'users' => $this->analytics->userAnalytics(),
            'revenue' => $this->analytics->revenueAnalytics(),
            'growth' => $this->analytics->growthMetrics(),
            'risk' => $this->analytics->riskMonitoring(),
            'system' => $this->analytics->systemHealth(),
        ]);
    }

    public function auditLogs(): JsonResponse
    {
        return response()->json($this->auditLogs->latest());
    }
}
