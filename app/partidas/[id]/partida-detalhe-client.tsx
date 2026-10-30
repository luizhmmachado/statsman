"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type MatchData = {
  matchid?: string;
  players?: Array<{
    steamid?: string;
    name?: string;
    team?: string;
    kills?: number;
    deaths?: number;
    assists?: number;
    mvps?: number;
    score?: number;
  }>;
};

export function PartidaDetalheClient() {
  const params = useSearchParams();
  const code = params.get("code");
  const [data, setData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    fetch(`/api/steam-match?code=${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((j) => {
        const d = j?.data?.result ?? j?.data ?? j;
        setData(d as MatchData);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [code]);

  if (!code) {
    return (
      <div className="card p-6 text-sm text-muted">
        Informe o share code na URL: /partidas/&lt;id&gt;?code=CSGO-...
      </div>
    );
  }
  if (loading) return <p className="text-sm text-muted">Carregando partida...</p>;
  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!data) return <p className="text-sm text-muted">Sem dados.</p>;

  const players = data.players ?? [];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-ink">Detalhe da partida</h1>
      <p className="font-mono text-xs text-muted">Match ID: {data.matchid ?? "—"}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="py-2">Jogador</th>
              <th className="py-2">Time</th>
              <th className="py-2">K</th>
              <th className="py-2">D</th>
              <th className="py-2">A</th>
              <th className="py-2">MVP</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr key={i} className="border-t border-border">
                <td className="py-2 text-ink">{p.name ?? p.steamid ?? "—"}</td>
                <td className="py-2 text-muted">{p.team ?? "—"}</td>
                <td className="py-2">{p.kills ?? "—"}</td>
                <td className="py-2">{p.deaths ?? "—"}</td>
                <td className="py-2">{p.assists ?? "—"}</td>
                <td className="py-2">{p.mvps ?? "—"}</td>
                <td className="py-2">{p.score ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {players.length === 0 && (
        <p className="text-sm text-muted">Nenhum jogador retornado (verifique a chave Steam ou o share code).</p>
      )}
    </div>
  );
}
