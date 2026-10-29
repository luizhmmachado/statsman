"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, History, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { formatDate } from "@/lib/format";
import {
  clearHistory,
  getHistory,
  removeHistoryEntry,
  saveLastResult,
} from "@/lib/storage";
import type { AnalysisResult, HistoryEntry } from "@/lib/types";

export function HistoryClient() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  const reopen = async (entry: HistoryEntry) => {
    setLoadingId(entry.id);
    setError(null);
    try {
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meInput: entry.meInput, players: entry.players }),
      });
      const body = (await response.json()) as AnalysisResult & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Não foi possível reabrir a análise.");
      const result: AnalysisResult = { ...body, mapName: entry.mapName ?? body.mapName };
      saveLastResult(result);
      router.push("/resultado");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível reabrir a análise.");
    } finally {
      setLoadingId(null);
    }
  };

  const remove = (id: string) => {
    removeHistoryEntry(id);
    setEntries(getHistory());
  };

  const clear = () => {
    if (!window.confirm("Apagar todo o histórico local?")) return;
    clearHistory();
    setEntries([]);
  };

  return (
    <>
      <AppHeader />
      <main className="container-app pb-24 pt-8 md:pb-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              Histórico local
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Seus últimos lobbies
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Guardamos apenas os links e o resumo. Ao reabrir, os dados públicos são consultados
              novamente — nada de cache de terceiros.
            </p>
          </div>
          {entries && entries.length > 0 && (
            <button type="button" onClick={clear} className="btn-secondary">
              <Trash2 size={14} />
              Limpar histórico
            </button>
          )}
        </div>

        {error && (
          <div className="mt-5 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2.5 text-[11px] text-danger">
            {error}
          </div>
        )}

        {entries === null && (
          <div className="mt-8 space-y-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-xl border border-border bg-surface" />
            ))}
          </div>
        )}

        {entries !== null && entries.length === 0 && (
          <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed border-border py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-surface text-muted">
              <History size={20} />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink">
              Nenhuma análise salva
            </h2>
            <p className="mt-1 max-w-sm text-xs leading-5 text-muted">
              Assim que você analisar um lobby, ele aparece aqui para reabrir com um clique.
            </p>
            <Link href="/analisar" className="btn-primary mt-5">
              Analisar lobby
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        <div className="mt-8 space-y-2.5">
          {entries?.map((entry) => (
            <article
              key={entry.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border/80 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-sm font-semibold text-ink">
                    {entry.label}
                  </h2>
                  <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted">
                    {entry.players.length} jogadores
                  </span>
                </div>
                <p className="mt-1 font-mono text-[10px] text-muted">
                  {formatDate(entry.createdAt)} · {entry.meInput.slice(0, 52)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => reopen(entry)}
                  disabled={loadingId === entry.id}
                  className="btn-secondary"
                >
                  {loadingId === entry.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RotateCcw size={14} />
                  )}
                  {loadingId === entry.id ? "Reabrindo" : "Reabrir"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(entry.id)}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted hover:border-danger/40 hover:text-danger"
                  aria-label="Remover do histórico"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer app />
    </>
  );
}
