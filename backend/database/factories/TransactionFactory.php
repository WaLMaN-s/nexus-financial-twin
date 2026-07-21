<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => 'expense',
            'category' => $this->faker->randomElement(['food', 'transport', 'shopping', 'entertainment']),
            'description' => $this->faker->sentence(3),
            'amount' => $this->faker->numberBetween(20_000, 2_000_000),
            'occurred_at' => $this->faker->dateTimeBetween('-3 months'),
            'is_recurring' => false,
        ];
    }

    public function income(float $amount = 15_000_000): static
    {
        return $this->state(fn () => [
            'type' => 'income',
            'category' => 'salary',
            'amount' => $amount,
            'is_recurring' => true,
        ]);
    }
}
