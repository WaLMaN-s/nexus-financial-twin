"use client";

import { motion } from "framer-motion";

/** Radial 0-100 score gauge. Color reflects status band; number is the hero. */
export function HealthRing({
  score,
  size = 132,
  label,
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const arc = (score / 100) * circumference * 0.75;
  const track = circumference * 0.75;

  const color =
    score >= 70
      ? "var(--status-good)"
      : score >= 50
        ? "var(--status-warning)"
        : "var(--status-critical)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
          strokeDasharray={`${track} ${circumference}`}
          strokeLinecap="round"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${arc} ${circumference}` }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight">{score}</span>
        {label && (
          <span className="text-[11px] font-medium text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
