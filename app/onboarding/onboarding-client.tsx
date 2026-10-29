"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck, UserRound } from "lucide-react";
import { Brand } from "@/components/Brand";
import { LevelBadge } from "@/components/LevelBadge";
import { getMe, saveMe } from "@/lib/storage";
import { formatSigned } from "@/lib/format";
import type { MeProfile, PlayerAnalysis } from "@/lib/types";

const examples = [
  "https://steamcommunity.com/profiles/76561198034202275",
  "https://leetify.com/app/profile/76561198034202275",
  "https://gamersclub.com.br/player/1",
];

export function OnboardingClient() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<PlayerAnalysis | null>(null);
  const [saved, setSaved] = useState<MeProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSaved(getMe());
  }, []);

  const resolve = async () => {
    const value = input.trim();
    if (!value) {
      setError("Cole o link do seu perfil ou o nickname.");
      return;
    }
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const response = await fetch(`/api/player?input=${encodeURIComponent(value)}&hltv=0`);
      const body = (await response.json()) as { player?: PlayerAnalysis; error?: string };
      if (!response.ok || !body.player) {
        throw new Error(body.error ?? "Não foi possível encontrar o perfil.");
      }
      setPreview(body.player);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível encontrar o perfil.");
    } finally {
      setLoading(false);
    }
  };

  const confirm = () => {
    if (!preview) return;
    const profile: MeProfile = {
      steamId64: preview.steamId64,
      name: preview.name,
      avatarUrl: preview.avatarUrl,
      input: preview.input,
      updatedAt: new Date().toISOString(),
    };
    saveMe(profile);
    window.dispatchEvent(new Event("statsman:me-updated"));
    router.push("/analisar");
  };

  return (
    <main className="container-app flex min-h-screen flex-col py-6">
      <div className="flex items-center justify-between">
        <Brand />
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink">
          <ArrowLeft size={14} />
          Voltar
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-10">
        <div className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          <span className="text-primary">01</span>
          <span className="h-px w-8 bg-border" />
          <span>02</span>
          <span className="h-px w-8 bg-border" />
          <span>03</span>
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          Conecte o seu perfil
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          O seu perfil é a régua da comparação. Use um link público da Steam, Leetify ou
          GamersClub — não pedimos senha.
        </p>

        {saved && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
            {saved.avatarUrl ? (
              <img src={saved.avatarUrl} alt="" className="h-11 w-11 rounded-lg object-cover" />
            ) : (
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-surface2 text-muted">
                <UserRound size={18} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.16em] text-primary">
                Perfil conectado
              </p>
              <p className="truncate font-display text-sm text-ink">{saved.name}</p>
            </div>
            <Link href="/analisar" className="btn-secondary">
              Continuar
            </Link>
          </div>
        )}

        <div className="mt-6">
          <label htmlFor="profile" className="mb-1.5 block text-xs text-muted">
            Link ou nickname
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
              className="btn-primary justify-center sm:w-auto"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {loading ? "Buscando" : "Buscar perfil"}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setInput(example)}
                className="rounded border border-border px-2 py-1 font-mono text-[9px] text-muted hover:border-primary/30 hover:text-ink"
              >
                {example.replace("https://", "").slice(0, 38)}
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-3 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-[11px] text-danger">
              {error}
            </p>
          )}
        </div>

        {preview && (
          <div className="mt-6 rounded-xl border border-border bg-surface p-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Perfil encontrado
            </p>
            <div className="flex items-center gap-3">
              {preview.avatarUrl ? (
                <img src={preview.avatarUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-surface2 text-muted">
                  <UserRound size={20} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-semibold text-ink">
                  {preview.name}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <LevelBadge kind="gc" value={preview.levels.gamersClub} />
                  <LevelBadge kind="faceit" value={preview.levels.faceit} />
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted">Leetify</p>
                <p className="font-mono text-sm text-primary">
                  {formatSigned(preview.metrics.leetifyRating, 2)}
                </p>
              </div>
            </div>

            <button type="button" onClick={confirm} className="btn-primary mt-4 w-full justify-center">
              <Check size={15} />
              Este é o meu perfil
            </button>
          </div>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-surface/50 p-4">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
          <p className="text-[11px] leading-5 text-muted">
            Usamos apenas dados públicos. Seu perfil fica salvo no seu navegador e nenhuma senha
            da Steam é solicitada.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between text-xs">
          <Link href="/analisar" className="text-muted hover:text-ink">
            Pular por agora
          </Link>
          <span className="inline-flex items-center gap-1 text-muted">
            Próximo: montar lobby
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </main>
  );
}
