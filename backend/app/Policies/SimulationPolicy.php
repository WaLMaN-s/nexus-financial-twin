<?php

namespace App\Policies;

use App\Models\Simulation;
use App\Models\User;

class SimulationPolicy
{
    public function view(User $user, Simulation $simulation): bool
    {
        return $simulation->user_id === $user->id;
    }
}
