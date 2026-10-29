import Link from "next/link";
import {
  ArrowRight,
  Check,
  ClipboardPaste,
  Crosshair,
  Gauge,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  Users,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { LandingHeader } from "@/components/LandingHeader";
import { LevelBadge } from "@/components/LevelBadge";

const steps = [
  {
    icon: ClipboardPaste,
    title: "Cole os perfis",
    text: "Steam, Leetify, GamersClub, FACEIT ou nickname. O StatsMan resolve a Steam e busca os dados públicos.",
  },
  {
    icon: Gauge,
    title: "Compare com o seu",
    text: "Seu perfil é a régua. Veja Leetify Rating, Aim, ADR, winrate e a média dos adversários lado a lado.",
  },
  {
    icon: Swords,
    title: "Entre sabendo",
    text: "Índice de ameaça, confronto direto e dicas objetivas de como jogar contra cada adversário.",
  },
];

const features = [
  {
    icon: Target,
    title: "Ratings no mesmo lugar",
    text: "Leetify Rating, HLTV Rating (média Leetify), aim, positioning, utility, clutch e opening.",
  },
  {
    icon: Users,
    title: "Lobby completo",
    text: "Até 10 jogadores, com aliados e adversários separados e ordenados por ameaça.",
  },
  {
    icon: ShieldCheck,
    title: "Sem senha da Steam",
    text: "Nada de login na conta. Apenas links e dados públicos das plataformas.",
  },
  {
    icon: Sparkles,
    title: "Nível GamersClub e FACEIT",
    text: "Nível e rating da GamersClub, level e ELO da FACEIT quando públicos.",
  },
  {
    icon: Crosshair,
    title: "Forma e mapas",
    text: "Últimas partidas, sequência de resultados e winrate por mapa de cada jogador.",
  },
  {
    icon: Gauge,
    title: "Índice de ameaça",
    text: "Uma leitura rápida e transparente, com pesos e limitações declarados. Não é probabilidade de vitória.",
  },
];

export default function LandingPage() {
  return (
    <>
      <LandingHeader />

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(183,243,74,0.10),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(34,48,61,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(34,48,61,0.18)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />

          <div className="container-app relative grid gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                CS2 · GamersClub · FACEIT
              </span>

              <h1 className="mt-6 max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink md:text-6xl">
                Conheça o lobby
                <br />
                antes da <span className="text-primary">primeira bala.</span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-muted md:text-base">
                Análise comparativa de adversários de CS2. Cole os perfis, compare com o seu e
                veja nível, ratings, forma e índice de ameaça — sem instalar nada e sem senha da
                Steam.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/analisar" className="btn-primary h-11 px-5">
                  Analisar meu lobby
                  <ArrowRight size={16} />
                </Link>
                <Link href="/exemplo" className="btn-secondary h-11 px-5">
                  Ver análise de exemplo
                </Link>
              </div>

              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted">
                {[
                  "Sem login na Steam",
                  "Dados públicos",
                  "Funciona no celular",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <Check size={12} className="text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-primary/5 blur-2xl" />
              <div className="relative rounded-2xl border border-border bg-surface/90 p-4 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                      Análise #8F2A1C
                    </p>
                    <p className="mt-1 font-display text-sm font-semibold text-ink">
                      Lobby · Mirage
                    </p>
                  </div>
                  <span className="rounded-full border border-warning/30 bg-warning/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-warning">
                    3 ameaças altas
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {[
                    { name: "vLkzz", gc: 19, faceit: 8, rating: "+0.21", threat: 84, tone: "text-danger" },
                    { name: "brunão", gc: 16, faceit: 6, rating: "+0.11", threat: 67, tone: "text-warning" },
                    { name: "frost", gc: 17, faceit: 7, rating: "+0.08", threat: 54, tone: "text-[#D8C46B]" },
                    { name: "k1ngz", gc: 14, faceit: 5, rating: "-0.02", threat: 38, tone: "text-muted" },
                  ].map((player, index) => (
                    <div
                      key={player.name}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                        index === 0 ? "border-danger/40 bg-danger/5" : "border-border bg-surface2/50"
                      }`}
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-md border border-border bg-bg font-display text-[10px] text-muted">
                        {player.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs text-ink">{player.name}</span>
                          {index === 2 && (
                            <span className="rounded bg-primary/15 px-1 font-mono text-[8px] uppercase text-primary">
                              você
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex gap-1">
                          <LevelBadge kind="gc" value={player.gc} />
                          <LevelBadge kind="faceit" value={player.faceit} />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs text-primary">{player.rating}</div>
                        <div className={`font-mono text-[9px] ${player.tone}`}>
                          {player.threat}/100
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-lg border border-border bg-bg/60 p-3">
                  <div className="flex items-center justify-between text-[10px] text-muted">
                    <span>Índice de ameaça do lobby</span>
                    <span className="font-mono text-ink">63 · Alto</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface2">
                    <div className="h-full w-[63%] rounded-full bg-gradient-to-r from-[#D8C46B] to-warning" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface/30">
          <div className="container-app grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
            {[
              ["Fontes", "Steam · Leetify · GC · FACEIT"],
              ["Jogadores", "Até 10 por análise"],
              ["Privacidade", "Sem senha, sem coleta"],
              ["Plataforma", "Web + PWA instalável"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                  {label}
                </p>
                <p className="mt-1 text-xs text-ink">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="container-app py-16 md:py-24">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            Como funciona
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Três passos. Sem planilha, sem print de perfil.
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-xl border border-border bg-surface p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon size={18} />
                    </span>
                    <span className="font-mono text-[10px] text-muted">0{index + 1}</span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-muted">{step.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="recursos" className="border-y border-border bg-surface/20">
          <div className="container-app py-16 md:py-24">
            <div className="max-w-2xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                O que você vê
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
                O suficiente para decidir o primeiro contato.
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                Cada métrica tem origem declarada. Quando um dado não existe, aparece como N/D —
                nunca como número inventado.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-xl border border-border bg-surface p-5">
                    <Icon size={18} className="text-primary" />
                    <h3 className="mt-3 font-display text-base font-semibold text-ink">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-6 text-muted">{feature.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container-app grid gap-6 py-16 md:grid-cols-2 md:py-24">
          <div className="rounded-xl border border-primary/25 bg-primary/[0.03] p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
              Fluxo principal
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold text-ink">Manual, hoje</h3>
            <p className="mt-2 text-xs leading-6 text-muted">
              Cole os links do lobby e receba a análise em segundos. É o caminho confiável para
              qualquer partida, incluindo matchmaking e treinos.
            </p>
            <Link href="/analisar" className="btn-primary mt-5">
              Analisar agora
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                Em breve
              </p>
              <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase text-muted">
                Beta
              </span>
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold text-ink">
              Companion GSI, pós-partida
            </h3>
            <p className="mt-2 text-xs leading-6 text-muted">
              O Game State Integration só entrega todos os jogadores em espectador ou GOTV. O
              companion vai servir para revisar o lobby depois do jogo, sem overlay e sem
              automação dentro da partida.
            </p>
            <p className="mt-3 text-[10px] leading-5 text-muted/80">
              O StatsMan não interfere no jogo, não lê memória e não automatiza nada.
            </p>
          </div>
        </section>

        <section className="border-y border-border bg-surface/20">
          <div className="container-app py-16 md:py-20">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
              Perguntas rápidas
            </h2>
            <div className="mt-8 grid gap-3 md:grid-cols-2">
              {[
                {
                  q: "Preciso conectar a Steam?",
                  a: "Não. O StatsMan usa links e dados públicos. Você pode colar o link da Steam, Leetify, GamersClub ou o nickname.",
                },
                {
                  q: "O HLTV Rating é o oficial?",
                  a: "Não. É a média das últimas 10 partidas calculada pela Leetify. Exibimos o rótulo completo e o fallback N/D.",
                },
                {
                  q: "O índice de ameaça prevê vitória?",
                  a: "Não. É uma leitura comparativa com pesos declarados. Não é probabilidade e não considera composição, mapa ou execução.",
                },
                {
                  q: "Vocês guardam meus dados?",
                  a: "O perfil e o histórico ficam no seu navegador. Não persistimos payloads de terceiros nem exigimos conta.",
                },
              ].map((item) => (
                <details
                  key={item.q}
                  className="group rounded-xl border border-border bg-surface p-4 open:border-primary/25"
                >
                  <summary className="cursor-pointer list-none text-sm text-ink marker:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {item.q}
                      <span className="font-mono text-muted transition-transform group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 text-xs leading-6 text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="container-app py-16 md:py-24">
          <div className="rounded-2xl border border-primary/25 bg-[radial-gradient(ellipse_at_top,rgba(183,243,74,0.10),transparent_70%)] p-8 text-center md:p-12">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
              O próximo lobby já começa ganho.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted">
              Cole os perfis, compare com o seu e entre na partida sabendo quem abre, quem
              clutcha e quem você deve evitar no primeiro contato.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/analisar" className="btn-primary h-11 px-5">
                Analisar meu lobby
                <ArrowRight size={16} />
              </Link>
              <Link href="/onboarding" className="btn-secondary h-11 px-5">
                Conectar meu perfil
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
