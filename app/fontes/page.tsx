import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Fontes de dados",
  description: "De onde vêm cada métrica exibida no StatsMan.",
};

const sources = [
  {
    name: "Steam",
    url: "https://steamcommunity.com/",
    what: "Resolução de vanity URL, SteamID64 e perfil público (nome e avatar).",
    notes: "Perfis privados podem limitar nome e avatar. Nenhum login é solicitado.",
  },
  {
    name: "Leetify",
    url: "https://leetify.com/",
    what: "Leetify Rating, aim, positioning, utility, clutch, opening, K/D, ADR, HS%, winrate, forma, mapas e banimentos públicos.",
    notes: "Fonte principal das métricas. Exigimos atribuição visível em todas as telas.",
  },
  {
    name: "HLTV Rating (média Leetify)",
    url: "https://leetify.com/",
    what: "Média do HLTV Rating das últimas 10 partidas retornada pela Leetify.",
    notes: "Não é o rating oficial da HLTV. Quando não existe, exibimos N/D.",
  },
  {
    name: "GamersClub",
    url: "https://gamersclub.com.br/",
    what: "Nível e rating públicos do jogador.",
    notes: "Integração não oficial por endpoint público. Pode ficar indisponível sem aviso.",
  },
  {
    name: "FACEIT",
    url: "https://www.faceit.com/",
    what: "Level, ELO e estatísticas lifetime quando a API oficial está configurada.",
    notes: "Sem FACEIT_API_KEY, usamos o level/ELO que a Leetify expõe.",
  },
];

export default function SourcesPage() {
  return (
    <>
      <AppHeader />
      <main className="container-app max-w-4xl pb-24 pt-8 md:pb-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Fontes</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
          De onde vem cada número
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          O StatsMan não inventa métricas. Cada campo tem origem declarada e, quando a fonte não
          responde, o valor aparece como N/D ou a análise é marcada como parcial.
        </p>

        <div className="mt-8 space-y-3">
          {sources.map((source) => (
            <article key={source.name} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-base font-semibold text-ink">{source.name}</h2>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-muted hover:text-ink"
                >
                  site oficial
                  <ExternalLink size={10} />
                </a>
              </div>
              <p className="mt-2 text-xs leading-6 text-muted">{source.what}</p>
              <p className="mt-2 text-[10px] leading-5 text-muted/80">{source.notes}</p>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-xl border border-primary/25 bg-primary/[0.03] p-5">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck size={16} />
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em]">
              Compromissos
            </h2>
          </div>
          <ul className="mt-3 space-y-2 text-[11px] leading-5 text-muted">
            <li>· Atribuição “Data Provided by Leetify” em todas as análises.</li>
            <li>· Nenhum payload de terceiros é persistido no navegador ou em servidor.</li>
            <li>· Nenhuma automação dentro da partida, overlay com hooks ou leitura de memória.</li>
            <li>· Índice de ameaça é uma estimativa comparativa, não probabilidade de vitória.</li>
          </ul>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/analisar" className="btn-primary">
            Analisar lobby
          </Link>
          <Link href="/exemplo" className="btn-secondary">
            Ver exemplo
          </Link>
        </div>
      </main>
      <Footer app />
    </>
  );
}
