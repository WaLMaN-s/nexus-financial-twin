<?php

namespace App\Repositories\Eloquent;

use App\Models\Goal;
use App\Repositories\Contracts\GoalRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentGoalRepository implements GoalRepositoryInterface
{
    public function forUser(int $userId): Collection
    {
        return Goal::query()
            ->where('user_id', $userId)
            ->orderBy('target_date')
            ->get();
    }

    public function find(int $id): ?Goal
    {
        return Goal::find($id);
    }

    public function create(int $userId, array $attributes): Goal
    {
        return Goal::create([...$attributes, 'user_id' => $userId]);
    }

    public function update(Goal $goal, array $attributes): Goal
    {
        $goal->update($attributes);

        return $goal->refresh();
    }

    public function delete(Goal $goal): void
    {
        $goal->delete();
    }
}
