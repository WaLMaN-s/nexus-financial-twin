<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AccountFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->randomElement(['BCA Savings', 'Mandiri Checking', 'Bibit Portfolio', 'Cash Wallet']),
            'type' => $this->faker->randomElement(['cash', 'savings', 'investment']),
            'balance' => $this->faker->numberBetween(1_000_000, 100_000_000),
            'interest_rate' => null,
        ];
    }
}
