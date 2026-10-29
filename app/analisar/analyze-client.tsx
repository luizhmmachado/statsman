"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardPaste,
  Info,
  Loader2,
  Map,
  ShieldCheck,
  Swords,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { notifyAnalysisReady } from "@/lib/notifications";
import { getMe, saveHistoryEntry, saveLastResult } from "@/lib/storage";
import type { AnalysisResult, MeProfile, Team } from "@/lib/types";

const stages = [
  "Resolvendo links e Steam IDs...",
  "Consultando perfis na Leetify...",
  "Cruzando GamersClub e FACEIT...",
  "Calculando índice de ameaça...",
];

type Slot = { id: number; value: string };

function makeSlots(count: number): Slot[] {
  return Array.from({ length: count }, (_, index) => ({ id: index, value: "" }));
}

function SlotInput({
  label,
  slot,
  onChange,
  onPaste,
  tone,
}: {
  label: string;
  slot: Slot;
  onChange: (value: string) => void;
  onPaste: () => void;
  tone: "ally" | "enemy";
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-wider text-muted">
        {label}
      </span>
      <input
        value={slot.value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Link, ID ou nickname"
        className={`input h-10 pl-20 pr-9 text-xs ${
          tone === "enemy" ? "focus:border-[#F0A35E]/60" : "focus:border-ct/60"
        }`}
        autoComplete="off"
        spellCheck={false}
      />
      <button
        type="button"
        onClick={onPaste}
        className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded text-muted hover:bg-surface2 hover:text-ink"
        aria-label={`Colar ${label}`}
        title="Colar da área de transferência"
      >
        <ClipboardPaste size={13} />
      </button>
    </div>
  );
}

export function AnalyzeClient() {
  const router = useRouter();
  const [me, setMe] = useState<MeProfile | null>(null);
  const [allies, setAllies] = useState<Slot[]>(() => makeSlots(4));
  const [enemies, setEnemies] = useState<Slot[]>(() => makeSlots(5));
  const [mapName, setMapName] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMe(getMe());
  }, []);

  useEffect(() => {
    if (!loading) {
      setStage(0);
      return;
    }
    const timer = window.setInterval(() => {
      setStage((current) => (current + 1) % stages.length);
    }, 1800);
    return () => window.clearInterval(timer);
  }, [loading]);

  const filled = useMemo(
    () =>
      allies.filter((slot) => slot.value.trim()).length +
      enemies.filter((slot) => slot.value.trim()).length,
    [allies, enemies],
  );

  const paste = async (setter: React.Dispatch<React.SetStateAction<Slot[]>>, id: number) => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) return;
      setter((slots) =>
        slots.map((slot) => (slot.id === id ? { ...slot, value: text.trim() } : slot)),
      );
    } catch {
      setError("O navegador bloqueou a leitura da área de transferência. Cole com Ctrl+V.");
    }
  };

  const submit = async () => {
    setError(null);

    if (!me) {
      setError("Conecte o seu perfil antes de analisar o lobby.");
      return;
    }

    const players = [
      ...allies
        .filter((slot) => slot.value.trim())
        .map((slot) => ({ input: slot.value.trim(), team: "ally" as Team })),
      ...enemies
        .filter((slot) => slot.value.trim())
        .map((slot) => ({ input: slot.value.trim(), team: "enemy" as Team })),
    ];

    if (players.length === 0) {
      setError("Adicione pelo menos um jogador para analisar.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meInput: me.input, players }),
      });
      const body = (await response.json()) as AnalysisResult & { error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? "Não foi possível concluir a análise.");
      }

      const result: AnalysisResult = {
        ...body,
        mapName: mapName.trim() || body.mapName,
      };

      saveLastResult(result);
      saveHistoryEntry({
        id: result.id,
        createdAt: result.createdAt,
        label: result.mapName ? `Lobby · ${result.mapName}` : "Lobby manual",
        mapName: result.mapName,
        meInput: me.input,
        meSteamId: me.steamId64,
        players,
      });

      const highThreats = result.players.filter(
        (player) => player.team === "enemy" && (player.threat?.score ?? 0) >= 60,
      ).length;
      void notifyAnalysisReady(result.id, highThreats);

      router.push("/resultado");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível concluir a análise.");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setAllies(makeSlots(4));
    setEnemies(makeSlots(5));
    setMapName("");
    setError(null);
  };

  return (
    <>
      <AppHeader />
      <main className="container-app pb-24 pt-8 md:pb-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              Nova análise
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Cole os perfis. Compare com o seu.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Aceita Steam, Leetify, GamersClub, FACEIT e nickname. Você pode informar de 1 a 9
              jogadores, além de você.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">
              Manual · CS2
            </span>
            <span className="rounded-full border border-primary/25 bg-primary/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-primary">
              {filled}/9 jogadores
            </span>
          </div>
        </div>

        {!me && (
          <div className="mt-6 flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <UserRound size={17} className="mt-0.5 shrink-0 text-warning" />
              <div>
                <p className="text-xs font-medium text-ink">Conecte o seu perfil primeiro</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  Ele é a régua da comparação e evita análise sem referência.
                </p>
              </div>
            </div>
            <Link href="/onboarding" className="btn-primary shrink-0 justify-center">
              Conectar perfil
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <section className="rounded-xl border border-border bg-surface p-4 md:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-ct" />
                  <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-ink">
                    Seu time
                  </h2>
                </div>
                <span className="font-mono text-[10px] text-muted">1 + {allies.filter((slot) => slot.value.trim()).length}/4</span>
              </div>

              <div className="mt-3 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/[0.03] px-3 py-2.5">
                {me?.avatarUrl ? (
                  <img src={me.avatarUrl} alt="" className="h-9 w-9 rounded-md object-cover" />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-surface2 text-muted">
                    <UserRound size={15} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-ink">{me?.name ?? "Você"}</p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-primary">
                    Perfil de referência
                  </p>
                </div>
                {me ? (
                  <Link href="/configuracoes" className="text-[10px] text-muted hover:text-ink">
                    Alterar
                  </Link>
                ) : (
                  <Link href="/onboarding" className="text-[10px] text-primary hover:underline">
                    Conectar
                  </Link>
                )}
              </div>

              <div className="mt-3 space-y-2">
                {allies.map((slot, index) => (
                  <SlotInput
                    key={slot.id}
                    label={`Aliado ${index + 2}`}
                    slot={slot}
                    tone="ally"
                    onChange={(value) =>
                      setAllies((slots) =>
                        slots.map((item) => (item.id === slot.id ? { ...item, value } : item)),
                      )
                    }
                    onPaste={() => paste(setAllies, slot.id)}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-surface p-4 md:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Swords size={16} className="text-t" />
                  <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-ink">
                    Adversários
                  </h2>
                </div>
                <span className="font-mono text-[10px] text-muted">
                  {enemies.filter((slot) => slot.value.trim()).length}/5
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {enemies.map((slot, index) => (
                  <SlotInput
                    key={slot.id}
                    label={`Inimigo ${index + 1}`}
                    slot={slot}
                    tone="enemy"
                    onChange={(value) =>
                      setEnemies((slots) =>
                        slots.map((item) => (item.id === slot.id ? { ...item, value } : item)),
                      )
                    }
                    onPaste={() => paste(setEnemies, slot.id)}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-surface p-4 md:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label htmlFor="map" className="mb-1.5 flex items-center gap-1.5 text-xs text-muted">
                    <Map size={13} />
                    Mapa (opcional)
                  </label>
                  <input
                    id="map"
                    value={mapName}
                    onChange={(event) => setMapName(event.target.value)}
                    placeholder="Mirage, Inferno, Ancient..."
                    className="input"
                    maxLength={40}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={clear} className="btn-secondary" disabled={loading}>
                    <Trash2 size={14} />
                    Limpar
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={loading || filled === 0}
                    className="btn-primary flex-1 justify-center sm:flex-none"
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Swords size={15} />}
                    {loading ? "Analisando" : "Analisar lobby"}
                  </button>
                </div>
              </div>

              {loading && (
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-3">
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Loader2 size={14} className="animate-spin" />
                    {stages[stage]}
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface2">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-primary/70" />
                  </div>
                  <p className="mt-2 text-[10px] text-muted">
                    Consultamos fontes públicas em paralelo. Pode levar alguns segundos por lobby.
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2.5 text-[11px] leading-5 text-danger">
                  {error}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-xl border border-border bg-surface p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                Sua régua
              </p>
              {me ? (
                <>
                  <div className="mt-3 flex items-center gap-3">
                    {me.avatarUrl ? (
                      <img src={me.avatarUrl} alt="" className="h-11 w-11 rounded-lg object-cover" />
                    ) : (
                      <span className="grid h-11 w-11 place-items-center rounded-lg bg-surface2 text-muted">
                        <UserRound size={17} />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm text-ink">{me.name}</p>
                      <p className="font-mono text-[9px] text-muted">{me.steamId64}</p>
                    </div>
                  </div>
                  <Link
                    href="/configuracoes"
                    className="mt-3 inline-flex text-[10px] text-muted hover:text-ink"
                  >
                    Trocar perfil
                  </Link>
                </>
              ) : (
                <div className="mt-3">
                  <p className="text-[11px] leading-5 text-muted">
                    Nenhum perfil conectado. Você pode explorar o formulário, mas a análise exige
                    uma referência.
                  </p>
                  <Link href="/onboarding" className="btn-secondary mt-3 w-full justify-center">
                    Conectar perfil
                  </Link>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-border bg-surface p-4">
              <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                <Info size={12} />
                Antes de colar
              </p>
              <ul className="mt-3 space-y-2 text-[11px] leading-5 text-muted">
                <li>· Links de perfil funcionam melhor que nickname.</li>
                <li>· Perfis privados podem retornar N/D em algumas métricas.</li>
                <li>· O mesmo jogador é contado uma vez, mesmo repetido.</li>
                <li>· A análise não altera nada na sua conta.</li>
              </ul>
            </section>

            <section className="rounded-xl border border-border bg-surface p-4">
              <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                <ShieldCheck size={12} />
                Privacidade
              </p>
              <p className="mt-3 text-[11px] leading-5 text-muted">
                Seu perfil e o histórico ficam no seu navegador. Não persistimos payloads de
                terceiros nem exigimos conta.
              </p>
              <Link href="/exemplo" className="mt-3 inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                Ver análise de exemplo
                <ArrowRight size={11} />
              </Link>
            </section>
          </aside>
        </div>

        <p className="mt-6 text-[10px] leading-5 text-muted">
          Ao analisar, você concorda que os dados exibidos são estimativas comparativas baseadas
          em fontes públicas. O índice de ameaça não é probabilidade de vitória.
        </p>
      </main>
      <Footer app />
    </>
  );
}
