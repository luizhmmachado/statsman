import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { ResultView } from "@/components/ResultView";
import { demoResult } from "@/lib/demo";

export const metadata: Metadata = {
  title: "Análise de exemplo",
  description: "Veja como o StatsMan apresenta um lobby completo de CS2.",
};

export default function ExamplePage() {
  return (
    <>
      <AppHeader />
      <div className="border-b border-border bg-warning/[0.04]">
        <div className="container-app py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-warning">
          Dados de exemplo · nenhuma consulta externa foi feita
        </div>
      </div>
      <ResultView result={demoResult} />
      <Footer app />
    </>
  );
}
