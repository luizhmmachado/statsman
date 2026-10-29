"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ShieldAlert, Swords, X } from "lucide-react";
import { FormSparkline } from "./FormSparkline";
import { LevelBadge } from "./LevelBadge";
import { ThreatBar } from "./ThreatBar";
import {
  faceitColor,
  formatPercent,
  formatRating,
  formatShortDate,
  formatSigned,
} from "@/lib/format";
import type { PlayerAnalysis } from "@/lib/types";

type Tab = "overview" | "matches" | "maps";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Visão geral" },
  { id: "matches", label: "Últimas partidas" },
  { id: "maps", label: "Mapas" },
];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface2/60 px-3 py-2.5">
      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-0.5 font-mono text-sm text-ink">{value}</div>
    </div>
  );
}

export function PlayerDrawer({
  player,
  isMe = false,
  onClose,
  onCompare,
}: {
  player: PlayerAnalysis | null;
  isMe?: boolean;
  onClose: () => void;
  onCompare?: (player: PlayerAnalysis) => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    setTab("overview");
  }, [player?.steamId64]);

  useEffect(() => {
    if (!player) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [player, onClose]);

  if (!player) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`Detalhes de ${player.name}`}>
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <aside className="relative flex h-full w-full max-w-[480px] flex-col border-l border-border bg-bg shadow-2xl">
        <header className="flex items-start gap-3 border-b border-border p-5">
          {player.avatarUrl ? (
            <img
              src={player.avatarUrl}
              alt=""
              className="h-14 w-14 rounded-xl border border-border object-cover"
            />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-xl border border-border bg-surface2 font-display text-lg text-muted">
              {player.name.slice(0, 2).toUpperCase()}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-display text-xl font-bold text-ink">{player.name}</h2>
              {isMe && (
                <span className="rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary">
                  Você
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <LevelBadge kind="gc" value={player.levels.gamersClub} />
              <LevelBadge kind="faceit" value={player.levels.faceit} elo={player.levels.faceitElo} />
              <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">
                Leetify {player.levels.leetify ?? "—"}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-muted">
              {player.levels.faceitElo
                ? `${player.levels.faceitElo.toLocaleString("pt-BR")} ELO FACEIT`
                : "Sem ELO FACEIT público"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border text-muted hover:text-ink"
            aria-label="Fechar detalhes"
          >
            <X size={16} />
          </button>
        </header>

        <div className="border-b border-border px-5 py-4">
          {isMe ? (
            <div className="rounded-lg border border-border bg-surface px-3 py-2.5 text-xs text-muted">
              Este é o seu perfil. O índice de ameaça é calculado apenas para os outros jogadores.
            </div>
          ) : (
            <ThreatBar score={player.threat?.score ?? null} />
          )}
          <div className="mt-3 flex items-center gap-3">
            <FormSparkline values={player.form} width={140} height={30} />
            <div className="text-[10px] leading-4 text-muted">
              Forma recente
              <br />
              <span className="font-mono text-ink">
                {player.form.length > 0
                  ? `${player.form.filter((value) => value > 0.5).length}/${player.form.length} positivas`
                  : "N/D"}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex border-b border-border px-5" aria-label="Detalhes">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`-mb-px border-b-2 px-3 py-3 text-xs transition-colors ${
                tab === item.id
                  ? "border-primary text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Leetify Rating" value={formatSigned(player.metrics.leetifyRating, 2)} />
                <Stat label="HLTV¹" value={formatRating(player.hltv?.average, 2)} />
                <Stat label="Aim" value={player.metrics.aim === null ? "N/D" : Math.round(player.metrics.aim).toString()} />
                <Stat label="Positioning" value={player.metrics.positioning === null ? "N/D" : Math.round(player.metrics.positioning).toString()} />
                <Stat label="Utility" value={player.metrics.utility === null ? "N/D" : Math.round(player.metrics.utility).toString()} />
                <Stat label="Clutch" value={formatSigned(player.metrics.clutch, 2)} />
                <Stat label="Opening" value={formatSigned(player.metrics.opening, 2)} />
                <Stat label="K/D" value={formatRating(player.metrics.kd, 2)} />
                <Stat label="ADR" value={player.metrics.adr === null ? "N/D" : Math.round(player.metrics.adr).toString()} />
                <Stat label="HS%" value={formatPercent(player.metrics.hs, { digits: 0 })} />
                <Stat label="Winrate" value={formatPercent(player.metrics.winrate, { digits: 0 })} />
                <Stat label="Partidas" value={player.metrics.totalMatches === null ? "N/D" : player.metrics.totalMatches.toLocaleString("pt-BR")} />
              </div>

              <p className="text-[10px] leading-4 text-muted">
                ¹ HLTV Rating é a média das últimas {player.hltv?.matchesCount ?? 10} partidas
                calculada pela Leetify, não o rating oficial da HLTV.
              </p>

              {player.bans.length > 0 && (
                <div className="rounded-lg border border-danger/30 bg-danger/5 p-3">
                  <div className="flex items-center gap-2 text-xs text-danger">
                    <ShieldAlert size={14} />
                    Banimentos públicos
                  </div>
                  <ul className="mt-2 space-y-1 text-[11px] text-muted">
                    {player.bans.map((ban) => (
                      <li key={`${ban.platform}-${ban.bannedSince ?? ""}`}>
                        {ban.platform}
                        {ban.bannedSince ? ` · desde ${formatShortDate(ban.bannedSince)}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {player.sources.leetify !== "ok" && (
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-[11px] leading-5 text-warning">
                  A Leetify não retornou dados para este jogador. Métricas de K/D, ADR e HS
                  podem vir da FACEIT quando disponíveis.
                </div>
              )}
            </div>
          )}

          {tab === "matches" && (
            <div className="space-y-2">
              {player.recentMatches.length === 0 && (
                <p className="text-xs text-muted">Nenhuma partida recente disponível.</p>
              )}
              {player.recentMatches.map((match) => {
                const rating = match.hltvRating ?? match.leetifyRating;
                return (
                  <div
                    key={match.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[10px] ${
                            match.won === true
                              ? "text-success"
                              : match.won === false
                                ? "text-danger"
                                : "text-muted"
                          }`}
                        >
                          {match.won === true ? "V" : match.won === false ? "D" : "—"}
                        </span>
                        <span className="truncate text-xs text-ink">{match.mapName}</span>
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-muted">
                        {formatShortDate(match.finishedAt)} · {match.kills ?? "—"}/
                        {match.deaths ?? "—"}/{match.assists ?? "—"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs text-ink">{formatSigned(rating, 2)}</div>
                      <div className="font-mono text-[9px] text-muted">ADR {match.adr === null ? "—" : Math.round(match.adr)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "maps" && (
            <div className="space-y-3">
              {player.mapWinrates.length === 0 && (
                <p className="text-xs text-muted">Sem dados de mapas suficientes.</p>
              )}
              {player.mapWinrates.map((map) => (
                <div key={map.mapName}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-xs text-ink">{map.mapName}</span>
                    <span className="font-mono text-[10px] text-muted">
                      {Math.round(map.winrate * 100)}% · {map.matches} jogos
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface2">
                    <div
                      className="h-full rounded-full bg-primary/80"
                      style={{ width: `${Math.max(0, Math.min(100, map.winrate * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="border-t border-border p-5">
          <div className="flex flex-wrap gap-2">
            {player.links.leetify && (
              <a href={player.links.leetify} target="_blank" rel="noreferrer" className="btn-secondary flex-1 justify-center">
                Leetify <ExternalLink size={13} />
              </a>
            )}
            {player.links.faceit && (
              <a
                href={player.links.faceit}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary flex-1 justify-center"
                style={{ color: faceitColor(player.levels.faceit) }}
              >
                FACEIT <ExternalLink size={13} />
              </a>
            )}
            {player.links.gamersClub && (
              <a href={player.links.gamersClub} target="_blank" rel="noreferrer" className="btn-secondary flex-1 justify-center">
                GamersClub <ExternalLink size={13} />
              </a>
            )}
          </div>
          {!isMe && onCompare && (
            <button
              type="button"
              onClick={() => onCompare(player)}
              className="btn-primary mt-3 w-full justify-center"
            >
              <Swords size={15} />
              Comparar comigo
            </button>
          )}
        </footer>
      </aside>
    </div>
  );
}
