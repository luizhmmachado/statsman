import type { Threat } from "./types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function average(values: Array<number | null | undefined>): number | null {
  const valid = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );
  if (valid.length === 0) return null;
  return valid.reduce((total, value) => total + value, 0) / valid.length;
}

export function formatRating(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "N/D";
  return value.toFixed(digits);
}

export function formatSigned(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}

export function formatInt(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "N/D";
  return Math.round(value).toLocaleString("pt-BR");
}

export function formatPercent(
  value: number | null | undefined,
  options: { input?: "ratio" | "percent"; digits?: number } = {},
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "N/D";
  const ratio = options.input === "percent" ? value / 100 : value;
  return `${(ratio * 100).toFixed(options.digits ?? 0)}%`;
}

export function formatWinrate(value: number | null | undefined): string {
  return formatPercent(value, { input: "ratio", digits: 0 });
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export function threatFromScore(score: number): Threat {
  if (score >= 80) return { score: Math.round(score), label: "Crítico" };
  if (score >= 60) return { score: Math.round(score), label: "Alto" };
  if (score >= 40) return { score: Math.round(score), label: "Médio" };
  return { score: Math.round(score), label: "Baixo" };
}

export function threatLabel(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) return "—";
  return threatFromScore(score).label;
}

export function threatColor(label: string): string {
  switch (label) {
    case "Crítico":
      return "#FF5A5F";
    case "Alto":
      return "#FFB020";
    case "Médio":
      return "#D8C46B";
    default:
      return "#8C9BAB";
  }
}

export function threatBorder(score: number | null | undefined): string {
  const label = threatLabel(score);
  switch (label) {
    case "Crítico":
      return "border-danger/50";
    case "Alto":
      return "border-warning/40";
    case "Médio":
      return "border-[#D8C46B]/30";
    default:
      return "border-border";
  }
}

export function threatTone(label: Threat["label"]): {
  text: string;
  bar: string;
  border: string;
  bg: string;
} {
  switch (label) {
    case "Crítico":
      return {
        text: "text-danger",
        bar: "bg-danger",
        border: "border-danger/50",
        bg: "bg-danger/5",
      };
    case "Alto":
      return {
        text: "text-warning",
        bar: "bg-warning",
        border: "border-warning/40",
        bg: "bg-warning/5",
      };
    case "Médio":
      return {
        text: "text-[#D8C46B]",
        bar: "bg-[#D8C46B]",
        border: "border-[#D8C46B]/30",
        bg: "bg-[#D8C46B]/5",
      };
    default:
      return {
        text: "text-muted",
        bar: "bg-muted",
        border: "border-border",
        bg: "bg-transparent",
      };
  }
}

export function gamersClubColor(level: number | null | undefined): string {
  if (level === null || level === undefined) return "#5B6B7C";
  if (level >= 20) return "#FF5A5F";
  if (level >= 18) return "#F0A35E";
  if (level >= 15) return "#B7F34A";
  if (level >= 12) return "#4CC9F0";
  if (level >= 8) return "#8C9BAB";
  return "#5B6B7C";
}

export const levelColor = gamersClubColor;

export function faceitColor(level: number | null | undefined): string {
  if (!level) return "#5B6B7C";
  if (level >= 10) return "#FF5A5F";
  if (level >= 8) return "#F0A35E";
  if (level >= 4) return "#FFB020";
  return "#8C9BAB";
}

export function metricBarValue(
  metric: "aim" | "positioning" | "utility" | "clutch" | "opening",
  value: number | null,
): number {
  if (value === null || !Number.isFinite(value)) return 0;
  switch (metric) {
    case "clutch":
      return clamp((value / 0.2) * 100, 0, 100);
    case "opening":
      return clamp(((value + 0.08) / 0.16) * 100, 0, 100);
    default:
      return clamp(value, 0, 100);
  }
}

export function metricDisplay(
  metric: "aim" | "positioning" | "utility" | "clutch" | "opening",
  value: number | null,
): string {
  if (value === null || !Number.isFinite(value)) return "N/D";
  switch (metric) {
    case "clutch":
    case "opening":
      return formatSigned(value, 2);
    default:
      return Math.round(value).toString();
  }
}

export function plural(value: number, singular: string, pluralForm: string): string {
  return value === 1 ? singular : pluralForm;
}
