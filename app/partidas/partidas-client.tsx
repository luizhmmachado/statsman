"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/storage";
import Link from "next/link";
import type { MeProfile } from "@/lib/types";

type Match = {
  id: string;
  map_name: string;
  finished_at: string | null;
  stats: { steam64_id: string; total_kills?: number; total_deaths?: number; kd_ratio?: number; leetify_rating?: number }[];
};

export function PartidasClient() {
  const [me, setMe] = useState<MeProfile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [windowSize, setWindowSize] = useState<10 | 30 | 90>(10);
  const [authCode, setAuthCode] = useState("");
  const [steamMatches, setSteamMatches] = useState<string[]>([]);
  const [loadingSteam, setLoadingSteam] = useState(false);
  const [steamError, setSteamError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMe(getMe());
  }, []);

  const load = async () => {
    if (!me?.steamId64) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api-public.cs-prod.leetify.com/v3/profile/matches?steam64_id=${encodeURIComponent(me.steamId64)}`,
      );
      if (res.ok) setMatches((await res.json()) as Match[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (me?.steamId64) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.steamId64]);

  const slice = matches.slice(0, windowSize);
  const avgLeetify = slice.length
    ? slice.reduce((t, m) => t + (m.stats?.[0]?.leetify_rating ?? 0), 0) / slice.length
    : 0;
  const avgKd = slice.length
    ? slice.reduce((t, m) => {
        const s = m.stats?.[0];
        return t + (s && s.total_deaths ? (s.total_kills ?? 0) / s.total_deaths : 0);
      }, 0) / slice.length
    : 0;

  const fetchSteamMatches = async () => {
    if (!me?.steamId64 || !authCode) return;
    setLoadingSteam(true);
    setSteamError(null);
    try {
      const res = await fetch(`/api/steam-matches?steamId=${encodeURIComponent(me.steamId64)}&authCode=${encodeURIComponent(authCode)}`);
      const json = await res.json();
      if (!res.ok) setSteamError(json.error ?? "Erro");
      setSteamMatches(json.codes ?? []);
    } catch (e) {
      setSteamError(String(e));
    } finally {
      setLoadingSteam(false);
    }
  };

  if (!me) {
    return (
      <div className="card p-6 text-sm text-muted">
        Conecte seu perfil em /configuracoes para ver suas partidas.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-ink">Suas partidas recentes</h1>
      <p className="text-sm text-muted">
        {me.name} · {matches.length} partida(s) carregada(s) via Leetify.
      </p>
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold text-ink">Partidas via Steam (auth code)</h2>
        <div className="flex gap-2">
          <input value={authCode} onChange={(e) => setAuthCode(e.target.value)} placeholder="Auth code (ex: 93VU-FF7HR-5BGL)" className="input flex-1" />
          <button onClick={fetchSteamMatches} disabled={loadingSteam || !authCode} className="btn-primary">
            {loadingSteam ? "..." : "Buscar"}
          </button>
        </div>
        {steamError && <p className="text-sm text-danger">{steamError}</p>}
        {steamMatches.length === 0 && !loadingSteam && !steamError && (
          <p className="text-sm text-muted">Nenhum código retornado.</p>
        )}
        {steamMatches.length > 0 && (
          <ul className="space-y-1">
            {steamMatches.map((c, i) => (
              <li key={i} className="font-mono text-xs text-muted">{c}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex gap-2">
        {[10, 30, 90].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setWindowSize(n as 10 | 30 | 90)}
            className={`rounded-lg px-3 py-1.5 text-sm ${windowSize === n ? "bg-primary text-primaryInk" : "bg-surface2 text-muted"}`}
          >
            Últimas {n}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="card p-4">
          <div className="text-xs text-muted">Leetify Rating (média)</div>
          <div className="font-mono text-xl text-ink">{avgLeetify.toFixed(3)}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted">K/D (média)</div>
          <div className="font-mono text-xl text-ink">{avgKd.toFixed(2)}</div>
        </div>
      </div>
      {loading && <p className="text-sm text-muted">Carregando...</p>}
      <ul className="space-y-2">
        {matches.map((m) => {
          const s = m.stats?.[0];
          return (
            <li key={m.id} className="card relative flex items-center justify-between p-4">
              <Link href={`/partidas/${m.id}`} className="absolute inset-0" aria-label="Ver detalhes" />
              <div>
                <div className="font-semibold text-ink">{m.map_name ?? "—"}</div>
                <div className="font-mono text-xs text-muted">
                  {m.finished_at ? new Date(m.finished_at).toLocaleString("pt-BR") : "—"}
                </div>
              </div>
              <div className="font-mono text-sm text-ink">
                {s?.total_kills ?? "—"}K / {s?.total_deaths ?? "—"}D
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
