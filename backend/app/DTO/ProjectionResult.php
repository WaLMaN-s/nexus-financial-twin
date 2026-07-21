<?php

namespace App\DTO;

final readonly class ProjectionResult
{
    /** @param array<string, ScenarioProjection> $scenarios keyed best | expected | worst */
    public function __construct(
        public FinancialSnapshot $snapshot,
        public array $scenarios,
    ) {}

    public function toArray(): array
    {
        return [
            'snapshot' => $this->snapshot->toArray(),
            'scenarios' => array_map(
                fn (ScenarioProjection $s) => $s->toArray(),
                $this->scenarios,
            ),
        ];
    }
}
