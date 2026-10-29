"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  Download,
  ExternalLink,
  Loader2,
  LogOut,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { InstallButton } from "@/components/InstallButton";
import { LevelBadge } from "@/components/LevelBadge";
import { NotificationToggle } from "@/components/NotificationToggle";
import { formatSigned } from "@/lib/format";
import {
  clearHistory,
  clearMe,
  getHistory,
  getMe,
  saveMe,
  setNotificationsEnabled,
} from "@/lib/storage";
import type { MeProfile, PlayerAnalysis } from "@/lib/types";

export function SettingsClient() {
  const [me, setMe] = useState<MeProfile | null | undefined>(undefined);
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<PlayerAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const current = getMe();
    setMe(current);
    setInput(current?.input ?? "");
  }, []);

  const resolve = async () => {
    const value = input.trim();
    if (!value) {
      setError("Informe o link ou nickname do perfil.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    setPreview(null);
    try {
      const response = await fetch(`/api/player?input=${encodeURIComponent(value)}&hltv=0`);
      const body = (await response.json()) as { player?: PlayerAnalysis; error?: string };
      if (!response.ok || !body.player) {
        throw new Error(body.error ?? "Perfil não encontrado.");
      }
      setPreview(body.player);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Perfil não encontrado.");
    } finally {
      setLoading(false);
    }
  };

  const savePreview = () => {
    if (!preview) return;
    const profile: MeProfile = {
      steamId64: preview.steamId64,
      name: preview.name,
      avatarUrl: preview.avatarUrl,
      input: preview.input,
      updatedAt: new Date().toISOString(),
    };
    saveMe(profile);
    setMe(profile);
    setPreview(null);
    setMessage("Perfil atualizado.");
    window.dispatchEvent(new Event("statsman:me-updated"));
  };

  const disconnect = () => {
    if (!window.confirm("Desconectar o perfil deste navegador?")) return;
    clearMe();
    setMe(null);
    setInput("");
    setPreview(null);
    setMessage("Perfil desconectado. O histórico local foi mantido.");
    window.dispatchEvent(new Event("statsman:me-updated"));
  };

  const clearAll = () => {
    if (!window.confirm("Apagar perfil, histórico e preferências deste navegador?")) return;
    clearMe();
    clearHistory();
    setNotificationsEnabled(false);
    setMe(null);
    setInput("");
    setPreview(null);
    setMessage("Dados locais apagados.");
    window.dispatchEvent(new Event("statsman:me-updated"));
    window.dispatchEvent(new Event("statsman:settings-updated"));
  };

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      me: getMe(),
      history: getHistory(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "statsman-dados.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <AppHeader />
      <main className="container-app max-w-4xl pb-24 pt-8 md:pb-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          Configurações
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Seu perfil e preferências
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Tudo fica neste navegador. Nada é enviado para uma conta ou banco de dados do StatsMan.
        </p>

        {(message || error) && (
          <div
            className={`mt-5 rounded-lg border px-3 py-2.5 text-[11px] ${
              error
                ? "border-danger/30 bg-danger/5 text-danger"
                : "border-success/30 bg-success/5 text-success"
            }`}
          >
            {error ?? message}
          </div>
        )}

        <section className="mt-6 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <UserRound size={16} className="text-ct" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-ink">
              Perfil de referência
            </h2>
          </div>

          {me === undefined ? (
            <div className="mt-4 h-16 animate-pulse rounded-lg bg-surface2" />
          ) : me ? (
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3">
                {me.avatarUrl ? (
                  <img src={me.avatarUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-surface2 text-muted">
                    <UserRound size={19} />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-ink">
                    {me.name}
                  </p>
                  <p className="font-mono text-[10px] text-muted">{me.steamId64}</p>
                </div>
              </div>
              <button type="button" onClick={disconnect} className="btn-secondary">
                <LogOut size={14} />
                Desconectar
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted">
              Nenhum perfil conectado.{" "}
              <Link href="/onboarding" className="text-primary hover:underline">
                Conectar agora
              </Link>
              .
            </p>
          )}

          <div className="mt-5 border-t border-border pt-5">
            <label htmlFor="profile" className="mb-1.5 block text-xs text-muted">
              Trocar por link ou nickname
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="profile"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") resolve();
                }}
                placeholder="https://steamcommunity.com/id/seu-nick"
                className="input flex-1"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={resolve}
                disabled={loading}
                className="btn-secondary justify-center"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                {loading ? "Buscando" : "Buscar"}
              </button>
            </div>
          </div>

          {preview && (
            <div className="mt-4 rounded-lg border border-border bg-surface2/50 p-3">
              <div className="flex items-center gap-3">
                {preview.avatarUrl ? (
                  <img src={preview.avatarUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface text-muted">
                    <UserRound size={16} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{preview.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <LevelBadge kind="gc" value={preview.levels.gamersClub} />
                    <LevelBadge kind="faceit" value={preview.levels.faceit} />
                  </div>
                </div>
                <span className="font-mono text-xs text-primary">
                  {formatSigned(preview.metrics.leetifyRating, 2)}
                </span>
              </div>
              <button type="button" onClick={savePreview} className="btn-primary mt-3 w-full justify-center">
                <Check size={14} />
                Usar este perfil
              </button>
            </div>
          )}
        </section>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <NotificationToggle />
          <InstallButton />
        </div>

        <section className="mt-4 rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-ink">
            Dados locais
          </h2>
          <p className="mt-2 text-[11px] leading-5 text-muted">
            Você pode exportar o que está salvo ou apagar tudo. O histórico contém apenas links e
            metadados da análise, nunca os dados retornados por terceiros.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={exportData} className="btn-secondary">
              <Download size={14} />
              Exportar dados
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="btn-secondary text-danger hover:border-danger/40"
            >
              <Trash2 size={14} />
              Apagar tudo
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-ink">
              Privacidade e limites
            </h2>
          </div>
          <ul className="mt-3 space-y-2 text-[11px] leading-5 text-muted">
            <li>· Não pedimos senha da Steam e não acessamos sua conta.</li>
            <li>· Não persistimos respostas da Leetify, GamersClub ou FACEIT.</li>
            <li>· O índice de ameaça é uma estimativa comparativa, não probabilidade de vitória.</li>
            <li>· HLTV Rating é a média das últimas 10 partidas calculada pela Leetify.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-muted">
            <Link href="/fontes" className="hover:text-ink">
              Fontes de dados
            </Link>
            <a
              href="https://github.com/luizhmmachado/statsman"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-ink"
            >
              Código no GitHub
              <ExternalLink size={10} />
            </a>
            <span>Versão 0.1.0</span>
          </div>
        </section>
      </main>
      <Footer app />
    </>
  );
}
