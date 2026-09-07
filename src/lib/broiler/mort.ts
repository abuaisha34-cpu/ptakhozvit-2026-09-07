/** Dead + culled from placement, never counting sold birds. */
export function cumulativeMortalityPct(
  placed: number,
  remainingHead: number,
  soldHead = 0,
): number {
  if (placed <= 0) return 0;
  const dead = Math.max(0, placed - remainingHead - Math.max(0, soldHead));
  return (dead / placed) * 100;
}

/** Birds that left alive (remaining + sold) / placed. */
export function livabilityPct(placed: number, remainingHead: number, soldHead = 0): number {
  if (placed <= 0) return 0;
  return ((remainingHead + Math.max(0, soldHead)) / placed) * 100;
}
