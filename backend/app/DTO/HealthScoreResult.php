<?php

namespace App\DTO;

final readonly class HealthScoreResult
{
    /**
     * @param  array<int, array{key: string, label: string, score: int, weight: float, value: float, explanation: string}>  $components
     */
    public function __construct(
        public int $score,
        public string $grade,
        public array $components,
    ) {}

    public function toArray(): array
    {
        return [
            'score' => $this->score,
            'grade' => $this->grade,
            'components' => $this->components,
        ];
    }
}
