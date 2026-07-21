<?php

namespace App\Repositories\Contracts;

use App\Models\Goal;
use Illuminate\Support\Collection;

interface GoalRepositoryInterface
{
    /** @return Collection<int, Goal> */
    public function forUser(int $userId): Collection;

    public function find(int $id): ?Goal;

    public function create(int $userId, array $attributes): Goal;

    public function update(Goal $goal, array $attributes): Goal;

    public function delete(Goal $goal): void;
}
