import { startWeight } from "./standards.ts";

/**
 * Biological FCR: all feed since placement / live-weight gain.
 * Gain = remaining birds × current avg + sold kg − chick weight of birds placed.
 * Dead birds stay in the numerator (their feed) and out of the denominator.
 */
export function biologicalFcr(input: {
  cumFeedKg: number;
  remainingHead: number;
  remainingAvgG: number;
  placed: number;
  cumSoldWeightKg?: number;
  breed?: string | null;
}): number {
  const remainingKg =
    (Math.max(0, input.remainingHead) * Math.max(0, input.remainingAvgG)) / 1000;
  const liveKg = Math.max(0, input.cumSoldWeightKg ?? 0) + remainingKg;
  const chickKg = (input.placed * startWeight(input.breed)) / 1000;
  const gainKg = liveKg - chickKg;
  if (gainKg <= 0 || input.cumFeedKg <= 0) return 0;
  return input.cumFeedKg / gainKg;
}
