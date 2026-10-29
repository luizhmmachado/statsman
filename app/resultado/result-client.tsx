"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { ResultView } from "@/components/ResultView";
import { getLastResult } from "@/lib/storage";
import type { AnalysisResult } from "@/lib/types";

export function ResultClient() {
  const [result, setResult] = useState<AnalysisResult | null | undefined>(undefined);

  useEffect(() => {
    setResult(getLastResult());
  }, []);

  if (result === undefined) {
    return (
      <>
        <AppHeader />
        <main className="container-app py-10">
          <div className="h-8 w-48 animate-pulse rounded bg-surface2" />
          <div className="mt-6 grid gap-3 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-36 animate-pulse rounded-xl border border-border bg-surface" />
            ))}
          </div>
        </main>
      </>
    );
  }

  if (result === null) {
    return (
      <>
        <AppHeader />
        <main className="container-app flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl border border-border bg-surface text-muted">
            <BarChart3 size={22} />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold text-ink">
            Nenhuma análise nesta sessão
          </h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">
            O último resultado fica disponível apenas enquanto esta aba estiver aberta. Rode uma
            nova análise ou abra um item do histórico.
          </p>
          <div className="mt-6 flex gap-2">
            <Link href="/analisar" className="btn-primary">
              Analisar lobby
              <ArrowRight size={15} />
            </Link>
            <Link href="/historico" className="btn-secondary">
              Abrir histórico
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <ResultView result={result} />
      <Footer app />
    </>
  );
}
