import { average, clamp, threatFromScore } from "./format";
import type { PlayerAnalysis, Threat } from "./types";

type Component = { weight: number; diff: number | null };

function normalizedDiff(
  playerValue: number | null,
  referenceValue: number | null,
  scale: number,
): number | null {
  if (playerValue === null || referenceValue === null) return null;
  return clamp((playerValue - referenceValue) / scale, -2.5, 2.5);
}

export function computeThreat(player: PlayerAnalysis, me: PlayerAnalysis | null): Threat | null {
  if (!me || player.steamId64 === me.steamId64) return null;

  const playerForm = average(player.form);
  const meForm = average(me.form);

  const components: Component[] = [
    {
      weight: 0.35,
      diff: normalizedDiff(player.metrics.leetifyRating, me.metrics.leetifyRating, 0.8),
    },
    { weight: 0.2, diff: normalizedDiff(player.metrics.aim, me.metrics.aim, 22) },
    {
      weight: 0.15,
      diff: normalizedDiff(player.metrics.opening, me.metrics.opening, 0.06),
    },
    { weight: 0.15, diff: normalizedDiff(player.metrics.adr, me.metrics.adr, 30) },
    { weight: 0.15, diff: normalizedDiff(playerForm, meForm, 0.7) },
  ];

  const available = components.filter((component) => component.diff !== null);
  if (available.length === 0) return null;

  const totalWeight = available.reduce((total, component) => total + component.weight, 0);
  const weighted = available.reduce(
    (total, component) => total + component.weight * (component.diff as number),
    0,
  );
  const score = clamp(50 + (weighted / totalWeight) * 55, 0, 100);
  return threatFromScore(score);
}
