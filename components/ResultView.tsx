"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  RefreshCw,
  Share2,
  Swords,
  TriangleAlert,
  Users,
} from "lucide-react";
import { PlayerCard } from "./PlayerCard";
import { PlayerDrawer } from "./PlayerDrawer";
import { ThreatBar } from "./ThreatBar";
import {
  formatDate,
  formatPercent,
  formatRating,
  formatSigned,
  metricBarValue,
  threatColor,
} from "@/lib/format";
import type { AnalysisResult, PlayerAnalysis } from "@/lib/types";

function Metric({
  label,
  me,
  lobby,
}: {
  label: string;
  me: string;
  lobby: string;
}) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-mono text-lg text-ink">{me}</span>
        <span className="font-mono text-[11px] text-muted">vs {lobby}</span>
      </div>
    </div>
  );
}

function CompareBar({
  label,
  me,
  opponent,
  format,
  scale,
}: {
  label: string;
  me: number | null;
  opponent: number | null;
  format: (value: number | null) => string;
  scale: (value: number | null) => number;
}) {
  const meWidth = scale(me);
  const opponentWidth = scale(opponent);
  const delta = me !== null && opponent !== null ? me - opponent : null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-muted">{label}</span>
        <span
          className={`font-mono text-[10px] ${
            delta === null ? "text-muted" : delta >= 0 ? "text-success" : "text-danger"
          }`}
        >
          {delta === null ? "—" : formatSigned(delta, 2)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-12 text-right font-mono text-[11px] text-primary">{format(me)}</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface2">
          <div className="h-full rounded-full bg-primary" style={{ width: `${meWidth}%` }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-12 text-right font-mono text-[11px] text-[#F0A35E]">
          {format(opponent)}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface2">
          <div className="h-full rounded-full bg-[#F0A35E]" style={{ width: `${opponentWidth}%` }} />
        </div>
      </div>
    </div>
  );
}

function playingNotes(me: PlayerAnalysis, opponent: PlayerAnalysis): string[] {
  const notes: string[] = [];
  const aim = opponent.metrics.aim ?? 0;
  const opening = opponent.metrics.opening ?? 0;
  const utility = opponent.metrics.utility ?? 0;
  const clutch = opponent.metrics.clutch ?? 0;
  const leetify = opponent.metrics.leetifyRating ?? 0;

  if (opening > (me.metrics.opening ?? 0) + 0.015) {
    notes.push("Evite duelos de abertura: ele ganha espaço cedo com frequência. Use utility para negar o primeiro contato.");
  }
  if (aim > 55) {
    notes.push("Não exponha ângulos longos. Force duelos curtos, com troca imediata e pré-aim alinhado.");
  }
  if (utility > 65) {
    notes.push("Espere o utilitário dele. Não avance por corredores previsíveis depois do smoke ou molotov.");
  }
  if (clutch > 0.08) {
    notes.push("Não deixe situações 1vX contra ele: feche o round em conjunto e negue o clutch.");
  }
  if (leetify > 0.08) {
    notes.push("Jogue em dupla e priorize troca. O rating alto indica impacto consistente, não só kills de fim de round.");
  }
  if (notes.length === 0) {
    notes.push("Perfil equilibrado: mantenha o padrão do time, comunique posições e evite duelos isolados.");
  }
  return notes.slice(0, 4);
}

export function ResultView({
  result,
  onNewAnalysis,
}: {
  result: AnalysisResult;
  onNewAnalysis?: () => void;
}) {
  const me = result.players.find((player) => player.steamId64 === result.meSteamId) ?? null;
  const enemies = useMemo(
    () =>
      result.players
        .filter((player) => player.team === "enemy")
        .sort((a, b) => (b.threat?.score ?? -1) - (a.threat?.score ?? -1)),
    [result.players],
  );
  const allies = useMemo(
    () =>
      result.players
        .filter((player) => player.team === "ally")
        .sort((a, b) => (b.threat?.score ?? -1) - (a.threat?.score ?? -1)),
    [result.players],
  );

  const [tab, setTab] = useState<"lobby" | "compare">("lobby");
  const [selectedId, setSelectedId] = useState<string | null>(enemies[0]?.steamId64 ?? null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selected =
    result.players.find((player) => player.steamId64 === selectedId) ?? enemies[0] ?? null;
  const drawerPlayer = result.players.find((player) => player.steamId64 === drawerId) ?? null;
  const topThreat = enemies[0] ?? null;

  const share = async () => {
    const lines = [
      `StatsMan · ${result.players.length} jogadores`,
      me ? `Você: ${me.name} (${formatSigned(me.metrics.leetifyRating, 2)})` : "",
      ...enemies.map(
        (player) =>
          `${player.name}: Leetify ${formatSigned(player.metrics.leetifyRating, 2)} · ameaça ${
            player.threat?.score ?? "—"
          }`,
      ),
    ].filter(Boolean);
    const text = `${lines.join("\n")}\n${window.location.href}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copie o resumo:", text);
    }
  };

  const compare = (player: PlayerAnalysis) => {
    setSelectedId(player.steamId64);
    setTab("compare");
    setDrawerId(null);
  };

  return (
    <>
      <main className="container-app pb-24 pt-8 md:pb-16">
        <Link
          href="/analisar"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink"
        >
          <ArrowLeft size={14} />
          Voltar para analisar
        </Link>

        <div className="flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Análise #{result.id.slice(0, 6)} · {formatDate(result.createdAt)}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
              {result.mapName ?? "Lobby analisado"}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {result.mode} · {result.players.length} jogadores · perfis públicos
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={share} className="btn-secondary">
              {copied ? <Check size={15} /> : <Share2 size={15} />}
              {copied ? "Copiado" : "Compartilhar"}
            </button>
            {onNewAnalysis ? (
              <button type="button" onClick={onNewAnalysis} className="btn-primary">
                <RefreshCw size={15} />
                Nova análise
              </button>
            ) : (
              <Link href="/analisar" className="btn-primary">
                <RefreshCw size={15} />
                Nova análise
              </Link>
            )}
          </div>
        </div>

        {result.warnings.length > 0 && (
          <div className="mt-5 rounded-xl border border-warning/30 bg-warning/5 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-warning">
              <TriangleAlert size={15} />
              {result.partial ? "Análise parcial" : "Avisos da análise"}
            </div>
            <ul className="mt-2 space-y-1 text-[11px] leading-5 text-muted">
              {result.warnings.slice(0, 5).map((warning) => (
                <li key={warning}>· {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {me && (
          <section className="mt-6 grid gap-3 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                Você x média dos adversários
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Metric
                  label="Leetify"
                  me={formatSigned(me.metrics.leetifyRating, 2)}
                  lobby={formatSigned(result.lobbyAverage.leetify, 2)}
                />
                <Metric
                  label="Aim"
                  me={me.metrics.aim === null ? "N/D" : Math.round(me.metrics.aim).toString()}
                  lobby={
                    result.lobbyAverage.aim === null
                      ? "N/D"
                      : Math.round(result.lobbyAverage.aim).toString()
                  }
                />
                <Metric
                  label="ADR"
                  me={me.metrics.adr === null ? "N/D" : Math.round(me.metrics.adr).toString()}
                  lobby={
                    result.lobbyAverage.adr === null
                      ? "N/D"
                      : Math.round(result.lobbyAverage.adr).toString()
                  }
                />
                <Metric
                  label="Winrate"
                  me={formatPercent(me.metrics.winrate, { digits: 0 })}
                  lobby={formatPercent(result.lobbyAverage.winrate, { digits: 0 })}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                Você x adversários
              </p>
              <div className="mt-3 space-y-3">
                <CompareBar
                  label="Aim"
                  me={me.metrics.aim}
                  opponent={result.lobbyAverage.aim}
                  format={(value) => (value === null ? "N/D" : Math.round(value).toString())}
                  scale={(value) => Math.max(0, Math.min(100, value ?? 0))}
                />
                <CompareBar
                  label="ADR"
                  me={me.metrics.adr}
                  opponent={result.lobbyAverage.adr}
                  format={(value) => (value === null ? "N/D" : Math.round(value).toString())}
                  scale={(value) => Math.max(0, Math.min(100, ((value ?? 0) / 120) * 100))}
                />
                <CompareBar
                  label="Winrate"
                  me={me.metrics.winrate}
                  opponent={result.lobbyAverage.winrate}
                  format={(value) => formatPercent(value, { digits: 0 })}
                  scale={(value) => Math.max(0, Math.min(100, (value ?? 0) * 100))}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Maior ameaça</p>
              {topThreat ? (
                <div className="mt-3">
                  <div className="flex items-center gap-3">
                    {topThreat.avatarUrl ? (
                      <img
                        src={topThreat.avatarUrl}
                        alt=""
                        className="h-10 w-10 rounded-lg border border-border object-cover"
                      />
                    ) : (
                      <span className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface2 font-display text-xs text-muted">
                        {topThreat.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-semibold text-ink">
                        {topThreat.name}
                      </p>
                      <p className="font-mono text-[10px]" style={{ color: threatColor(topThreat.threat?.label ?? "") }}>
                        {topThreat.threat?.label ?? "—"} · {topThreat.threat?.score ?? "—"}/100
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <ThreatBar score={topThreat.threat?.score ?? null} compact />
                  </div>
                  <button
                    type="button"
                    onClick={() => compare(topThreat)}
                    className="btn-secondary mt-3 w-full justify-center"
                  >
                    <Swords size={14} />
                    Comparar comigo
                  </button>
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted">Nenhum adversário informado.</p>
              )}
            </div>
          </section>
        )}

        <div className="mt-8 flex items-center gap-1 border-b border-border">
          <button
            type="button"
            onClick={() => setTab("lobby")}
            className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-3 text-xs transition-colors ${
              tab === "lobby" ? "border-primary text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Users size={14} />
            Lobby
          </button>
          <button
            type="button"
            onClick={() => setTab("compare")}
            className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-3 text-xs transition-colors ${
              tab === "compare" ? "border-primary text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Swords size={14} />
            Confronto
          </button>
        </div>

        {tab === "lobby" && (
          <section className="mt-5 grid gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-ink">
                  Seu time
                </h2>
                <span className="font-mono text-[10px] text-muted">
                  {1 + allies.length}/5
                </span>
              </div>
              <div className="space-y-2.5">
                {me && <PlayerCard player={me} isMe onSelect={(player) => setDrawerId(player.steamId64)} />}
                {allies.map((player) => (
                  <PlayerCard
                    key={player.steamId64}
                    player={player}
                    onSelect={(item) => setDrawerId(item.steamId64)}
                  />
                ))}
                {allies.length < 4 && (
                  <Link
                    href="/analisar"
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-[11px] text-muted transition-colors hover:border-primary/40 hover:text-ink"
                  >
                    <Users size={14} />
                    Adicionar aliados
                  </Link>
                )}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-ink">
                  Adversários
                </h2>
                <span className="font-mono text-[10px] text-muted">{enemies.length}/5</span>
              </div>
              <div className="space-y-2.5">
                {enemies.map((player) => (
                  <PlayerCard
                    key={player.steamId64}
                    player={player}
                    onSelect={(item) => setDrawerId(item.steamId64)}
                  />
                ))}
                {enemies.length === 0 && (
                  <p className="rounded-xl border border-dashed border-border p-4 text-center text-[11px] text-muted">
                    Nenhum adversário informado.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {tab === "compare" && (
          <section className="mt-5">
            {!me || !selected ? (
              <p className="rounded-xl border border-border bg-surface p-5 text-xs text-muted">
                Selecione um adversário para comparar.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {enemies.map((player) => (
                    <button
                      key={player.steamId64}
                      type="button"
                      onClick={() => setSelectedId(player.steamId64)}
                      className={`rounded-lg border px-3 py-1.5 text-[11px] transition-colors ${
                        selected.steamId64 === player.steamId64
                          ? "border-primary/50 bg-primary/10 text-ink"
                          : "border-border bg-surface text-muted hover:text-ink"
                      }`}
                    >
                      {player.name}
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                  <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                      Comparação direta
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex flex-1 items-center gap-2">
                        {me.avatarUrl ? (
                          <img src={me.avatarUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
                        ) : (
                          <span className="grid h-9 w-9 place-items-center rounded-lg bg-surface2 font-mono text-[10px] text-muted">
                            {me.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-xs text-ink">{me.name}</p>
                          <p className="font-mono text-[10px] text-primary">
                            {formatSigned(me.metrics.leetifyRating, 2)}
                          </p>
                        </div>
                      </div>
                      <Swords size={16} className="text-muted" />
                      <div className="flex flex-1 items-center justify-end gap-2 text-right">
                        <div className="min-w-0">
                          <p className="truncate text-xs text-ink">{selected.name}</p>
                          <p className="font-mono text-[10px] text-[#F0A35E]">
                            {formatSigned(selected.metrics.leetifyRating, 2)}
                          </p>
                        </div>
                        {selected.avatarUrl ? (
                          <img src={selected.avatarUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
                        ) : (
                          <span className="grid h-9 w-9 place-items-center rounded-lg bg-surface2 font-mono text-[10px] text-muted">
                            {selected.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <CompareBar
                        label="Aim"
                        me={me.metrics.aim}
                        opponent={selected.metrics.aim}
                        format={(value) => (value === null ? "N/D" : Math.round(value).toString())}
                        scale={(value) => metricBarValue("aim", value)}
                      />
                      <CompareBar
                        label="Positioning"
                        me={me.metrics.positioning}
                        opponent={selected.metrics.positioning}
                        format={(value) => (value === null ? "N/D" : Math.round(value).toString())}
                        scale={(value) => metricBarValue("positioning", value)}
                      />
                      <CompareBar
                        label="Utility"
                        me={me.metrics.utility}
                        opponent={selected.metrics.utility}
                        format={(value) => (value === null ? "N/D" : Math.round(value).toString())}
                        scale={(value) => metricBarValue("utility", value)}
                      />
                      <CompareBar
                        label="Clutch"
                        me={me.metrics.clutch}
                        opponent={selected.metrics.clutch}
                        format={(value) => formatSigned(value, 2)}
                        scale={(value) => metricBarValue("clutch", value)}
                      />
                      <CompareBar
                        label="Opening"
                        me={me.metrics.opening}
                        opponent={selected.metrics.opening}
                        format={(value) => formatSigned(value, 2)}
                        scale={(value) => metricBarValue("opening", value)}
                      />
                    </div>
                    <p className="mt-4 text-[10px] text-muted">
                      HLTV¹: você {formatRating(me.hltv?.average, 2)} · {selected.name}{" "}
                      {formatRating(selected.hltv?.average, 2)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                      Como jogar contra
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {playingNotes(me, selected).map((note) => (
                        <li key={note} className="flex gap-2 text-[11px] leading-5 text-muted">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-primary" />
                          {note}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDrawerId(selected.steamId64)}
                        className="btn-secondary flex-1 justify-center"
                      >
                        Ver detalhes
                      </button>
                      {selected.links.leetify && (
                        <a
                          href={selected.links.leetify}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary flex-1 justify-center"
                        >
                          Leetify
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted">
          <span>¹ HLTV Rating é a média das últimas 10 partidas, calculada pela Leetify.</span>
          <span>·</span>
          <span>Índice de ameaça é uma estimativa, não uma probabilidade de vitória.</span>
          <span>·</span>
          <span className="text-leetify">Data Provided by Leetify.</span>
        </p>
      </main>

      <PlayerDrawer
        player={drawerPlayer}
        isMe={drawerPlayer?.steamId64 === me?.steamId64}
        onClose={() => setDrawerId(null)}
        onCompare={compare}
      />
    </>
  );
}
