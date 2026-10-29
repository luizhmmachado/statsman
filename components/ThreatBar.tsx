import { clamp, threatColor, threatLabel } from "@/lib/format";

export function ThreatBar({
  score,
  compact = false,
}: {
  score: number | null;
  compact?: boolean;
}) {
  const safe = score === null ? null : clamp(score, 0, 100);
  const label = threatLabel(safe);
  const tone = threatColor(label);

  return (
    <div className={compact ? "space-y-1" : "space-y-1.5"}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
          Índice de ameaça
        </span>
        <span className="font-mono text-[11px]" style={{ color: tone }}>
          {safe === null ? "—" : `${Math.round(safe)} · ${label}`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface2">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${safe ?? 0}%`,
            backgroundColor: tone,
            boxShadow: safe === null ? undefined : `0 0 12px ${tone}66`,
          }}
        />
      </div>
    </div>
  );
}
