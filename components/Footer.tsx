import Link from "next/link";

export function Footer({ app = false }: { app?: boolean }) {
  return (
    <footer className={app ? "mt-16 border-t border-border" : "border-t border-border"}>
      <div className="container-app flex flex-col gap-6 py-8 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="text-xs text-leetify">
            Data Provided by{" "}
            <a
              href="https://leetify.com/"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-leetify/40 underline-offset-4 hover:decoration-leetify"
            >
              Leetify
            </a>
          </p>
          <p className="max-w-xl text-[11px] leading-5 text-muted">
            StatsMan não é afiliado à Valve, Leetify, FACEIT ou GamersClub. Níveis e ratings
            são dados públicos das respectivas plataformas.
          </p>
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted">
            <Link href="/#como-funciona" className="hover:text-ink">
              Como funciona
            </Link>
            <Link href="/fontes" className="hover:text-ink">
              Fontes de dados
            </Link>
            <Link href="/configuracoes" className="hover:text-ink">
              Privacidade
            </Link>
            <a
              href="https://github.com/luizhmmachado/statsman"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink"
            >
              Código
            </a>
          </nav>
          <p className="text-[11px] text-muted">
            Índice de ameaça é uma estimativa, não uma probabilidade de vitória.
          </p>
          <p className="text-[10px] text-muted/70">
            © 2026 StatsMan. Análise comparativa para Counter-Strike 2.
          </p>
        </div>
      </div>
    </footer>
  );
}
