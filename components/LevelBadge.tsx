import { levelColor } from "@/lib/format";

export function LevelBadge({
  kind,
  value,
  elo,
}: {
  kind: "gc" | "faceit";
  value: number | null;
  elo?: number | null;
}) {
  const label = kind === "gc" ? "GC" : "FACEIT";
  const color = kind === "gc" ? levelColor(value) : "#FF7A45";

  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-4"
      style={{ backgroundColor: `${color}1A`, color }}
      title={
        elo
          ? `${label} ${value ?? "—"} · ${elo} ELO`
          : `${label} ${value ?? "—"}`
      }
    >
      <span
        className="inline-block h-1.5 w-1.5 rotate-45 rounded-[1px]"
        style={{ backgroundColor: color }}
      />
      {label} {value ?? "—"}
    </span>
  );
}
