import { ExternalLink } from "lucide-react";
import { LevelBadge } from "./LevelBadge";
import { ThreatBar } from "./ThreatBar";
import {
  formatPercent,
  formatRating,
  formatSigned,
  threatBorder,
} from "@/lib/format";
import type { PlayerAnalysis } from "@/lib/types";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PlayerCard({
  player,
  isMe = false,
  onSelect,
  compact = false,
}: {
  player: PlayerAnalysis;
  isMe?: boolean;
  onSelect?: (player: PlayerAnalysis) => void;
  compact?: boolean;
}) {
  return (
    <article
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? () => onSelect(player) : undefined}
      onKeyDown={
        onSelect
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(player);
              }
            }
          : undefined
      }
      className={`group relative rounded-xl border bg-surface p-4 transition-colors ${threatBorder(
        player.threat?.score ?? null,
      )} ${onSelect ? "cursor-pointer hover:border-primary/40 hover:bg-surface2/60" : ""}`}
    >
      <div className="flex items-start gap-3">
        {player.avatarUrl ? (
          <img
            src={player.avatarUrl}
            alt=""
            className="h-11 w-11 shrink-0 rounded-lg border border-border object-cover"
            loading="lazy"
          />
        ) : (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-border bg-surface2 font-display text-sm text-muted">
            {initials(player.name)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="truncate font-display text-[15px] font-semibold leading-5 text-ink">
              {player.name}
            </h3>
            {isMe && (
              <span className="shrink-0 rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary">
                Você
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            <LevelBadge kind="gc" value={player.levels.gamersClub} />
            <LevelBadge
              kind="faceit"
              value={player.levels.faceit}
              elo={player.levels.faceitElo}
            />
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
            Leetify
          </div>
          <div
            className={`font-mono text-lg font-semibold ${
              player.metrics.leetifyRating === null
                ? "text-muted"
                : player.metrics.leetifyRating >= 0
                  ? "text-primary"
                  : "text-danger"
            }`}
          >
            {formatSigned(player.metrics.leetifyRating, 2)}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-1.5 border-y border-border/70 py-2.5">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted">
            HLTV<sup>1</sup>
          </div>
          <div className="font-mono text-xs text-ink">
            {formatRating(player.hltv?.average, 2)}
          </div>
        </div>
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted">Aim</div>
          <div className="font-mono text-xs text-ink">
            {player.metrics.aim === null ? "N/D" : Math.round(player.metrics.aim)}
          </div>
        </div>
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted">K/D</div>
          <div className="font-mono text-xs text-ink">
            {formatRating(player.metrics.kd, 2)}
          </div>
        </div>
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted">ADR</div>
          <div className="font-mono text-xs text-ink">
            {player.metrics.adr === null ? "N/D" : Math.round(player.metrics.adr)}
          </div>
        </div>
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted">HS</div>
          <div className="font-mono text-xs text-ink">
            {formatPercent(player.metrics.hs, { digits: 0 })}
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-3">
          <ThreatBar score={player.threat?.score ?? null} />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-muted">
          {player.levels.faceitElo ? `${player.levels.faceitElo} ELO` : "Sem ELO FACEIT"}
        </span>
        {player.links.leetify ? (
          <a
            href={player.links.leetify}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center gap-1 text-[10px] text-muted transition-colors hover:text-leetify"
          >
            Ver no Leetify
            <ExternalLink size={10} />
          </a>
        ) : (
          <span className="text-[10px] text-muted/60">Sem perfil Leetify</span>
        )}
      </div>
    </article>
  );
}
