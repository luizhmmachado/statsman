"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/storage";
import type { MeProfile } from "@/lib/types";

type Match = {
  id: string;
  map_name: string;
  finished_at: string | null;
  stats: { steam64_id: string; total_kills?: number; total_deaths?: number; kd_ratio?: number; leetify_rating?: number; total_assists?: number; dpr?: number }[];
};

export function PartidaDetalheClient({ id }: { id: string }) {
  const [me, setMe] = useState<MeProfile | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [code, setCode] = useState("");
  const [steamData, setSteamData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMe(getMe());
  }, []);

  useEffect(() => {
    if (!me?.steamId64) return;
    fetch(`https://api-public.cs-prod.leetify.com/v3/profile/matches?steam64_id=${encodeURIComponent(me.steamId64)}`)
      .then((r) => r.json())
      .then((d: Match[]) => setMatch(d.find((m) => m.id === id) ?? null));
  }, [me?.steamId64, id]);

  const fetchSteam = async () => {
    if (!code) return;
    setLoading(true);
    const res = await fetch(`/api/steam-match?code=${encodeURIComponent(code)}`);
    setSteamData(await res.json());
    setLoading(false);
  };

  const s = match?.stats?.[0];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-ink">Detalhe da partida</h1>
      {match && (
        <div className="card p-4 space-y-2">
          <div className="font-semibold text-ink">{match.map_name}</div>
          <div className="font-mono text-xs text-muted">
            {match.finished_at ? new Date(match.finished_at).toLocaleString("pt-BR") : "—"}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 text-sm">
            <div><span className="text-muted">Kills:</span> {s?.total_kills ?? "—"}</div>
            <div><span className="text-muted">Deaths:</span> {s?.total_deaths ?? "—"}</div>
            <div><span className="text-muted">K/D:</span> {s?.kd_ratio?.toFixed(2) ?? "—"}</div>
            <div><span className="text-muted">Leetify:</span> {s?.leetify_rating?.toFixed(3) ?? "—"}</div>
            <div><span className="text-muted">ADR:</span> {s?.dpr ?? "—"}</div>
            <div><span className="text-muted">Assists:</span> {s?.total_assists ?? "—"}</div>
          </div>
        </div>
      )}

      <div className="card p-4 space-y-3">
        <h2 className="font-semibold text-ink">Lobby completo (Steam)</h2>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Cole o share code CSGO-..."
            className="input flex-1"
          />
          <button onClick={fetchSteam} disabled={loading || !code} className="btn-primary">
            {loading ? "..." : "Buscar"}
          </button>
        </div>
        {steamData ? (
          <pre className="overflow-x-auto rounded-lg bg-surface2 p-3 text-xs">
            {JSON.stringify(steamData, null, 2).slice(0, 4000)}
          </pre>
        ) : null}
      </div>
    </div>
  );
}