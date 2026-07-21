<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class GoalFactory extends Factory
{
    public function definition(): array
    {
        $target = $this->faker->numberBetween(20_000_000, 500_000_000);

        return [
            'user_id' => User::factory(),
            'name' => $this->faker->randomElement(['Emergency Fund', 'House Down Payment', 'Dream Vacation']),
            'type' => $this->faker->randomElement(['emergency_fund', 'house', 'vacation']),
            'icon' => 'target',
            'target_amount' => $target,
            'current_amount' => $this->faker->numberBetween(0, (int) ($target * 0.8)),
            'monthly_contribution' => $this->faker->numberBetween(500_000, 5_000_000),
            'target_date' => $this->faker->dateTimeBetween('+1 year', '+5 years'),
            'status' => 'active',
        ];
    }
}
