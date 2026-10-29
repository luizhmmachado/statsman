"use client";

import Link from "next/link";
import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Brand } from "@/components/Brand";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container-app flex min-h-screen flex-col items-center justify-center py-16 text-center">
      <Brand />
      <span className="mt-10 grid h-12 w-12 place-items-center rounded-xl border border-danger/30 bg-danger/5 text-danger">
        <TriangleAlert size={20} />
      </span>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink">Algo saiu do mapa</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">
        A página encontrou um erro inesperado. Tente novamente; se persistir, abra uma nova
        análise.
      </p>
      <div className="mt-6 flex gap-2">
        <button type="button" onClick={reset} className="btn-primary">
          Tentar novamente
        </button>
        <Link href="/analisar" className="btn-secondary">
          Analisar lobby
        </Link>
      </div>
    </main>
  );
}
