/** Formatting helpers for IDR amounts and percentages. */

export function formatIDR(value: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) {
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (abs >= 1_000_000_000) return `${sign}Rp${trim(abs / 1_000_000_000)}M`;
    if (abs >= 1_000_000) return `${sign}Rp${trim(abs / 1_000_000)}jt`;
    if (abs >= 1_000) return `${sign}Rp${trim(abs / 1_000)}rb`;
    return `${sign}Rp${Math.round(abs)}`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function trim(n: number): string {
  const rounded = n >= 100 ? Math.round(n) : Math.round(n * 10) / 10;
  return String(rounded).replace(".", ",");
}

export function formatPercent(ratio: number, digits = 0): string {
  return `${(ratio * 100).toFixed(digits)}%`;
}

export function formatMonth(isoMonth: string): string {
  const [year, month] = isoMonth.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
