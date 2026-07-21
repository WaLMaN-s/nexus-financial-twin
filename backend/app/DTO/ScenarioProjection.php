<?php

namespace App\DTO;

final readonly class ScenarioProjection
{
    /**
     * @param  array<int, array{month: int, date: string, value: float}>  $series
     * @param  array<string, float>  $horizons  keyed '1y' | '3y' | '5y' | '10y'
     */
    public function __construct(
        public ScenarioAssumptions $assumptions,
        public array $series,
        public array $horizons,
    ) {}

    public function toArray(): array
    {
        return [
            'assumptions' => $this->assumptions->toArray(),
            'series' => $this->series,
            'horizons' => $this->horizons,
        ];
    }
}
