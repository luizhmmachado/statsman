import Link from "next/link";
import { Brand } from "@/components/Brand";

export default function NotFound() {
  return (
    <main className="container-app flex min-h-screen flex-col items-center justify-center py-16 text-center">
      <Brand />
      <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
        Erro 404
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Essa página não existe</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">
        O link pode ter mudado. Volte para a análise de lobby ou veja um exemplo completo.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/analisar" className="btn-primary">
          Analisar lobby
        </Link>
        <Link href="/" className="btn-secondary">
          Início
        </Link>
      </div>
    </main>
  );
}
