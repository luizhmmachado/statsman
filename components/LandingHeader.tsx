import Link from "next/link";
import { Brand } from "./Brand";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
      <div className="container-app flex h-16 items-center justify-between gap-6">
        <Brand />
        <nav className="hidden items-center gap-7 text-xs text-muted md:flex">
          <Link href="/#como-funciona" className="hover:text-ink">
            Como funciona
          </Link>
          <Link href="/#recursos" className="hover:text-ink">
            Recursos
          </Link>
          <Link href="/fontes" className="hover:text-ink">
            Fontes
          </Link>
          <Link href="/exemplo" className="hover:text-ink">
            Exemplo
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/exemplo" className="hidden text-xs text-muted hover:text-ink sm:inline">
            Ver exemplo
          </Link>
          <Link href="/analisar" className="btn-primary">
            Analisar lobby
          </Link>
        </div>
      </div>
    </header>
  );
}
