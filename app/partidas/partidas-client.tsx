"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/storage";
import type { MeProfile } from "@/lib/types";

type Match = {
  id: string;
  map_name: string;
  finished_at: string | null;
  stats: { steam64_id: string; total_kills?: number; total_deaths?: number; kd_ratio?: number }[];
};

export function PartidasClient() {
  const [me, setMe] = useState<MeProfile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
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
      {loading && <p className="text-sm text-muted">Carregando...</p>}
      <ul className="space-y-2">
        {matches.map((m) => {
          const s = m.stats?.[0];
          return (
            <li key={m.id} className="card flex items-center justify-between p-4">
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
