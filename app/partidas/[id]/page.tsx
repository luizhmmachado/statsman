import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { PartidaDetalheClient } from "./partida-detalhe-client";

export default function PartidaDetalhePage() {
  return (
    <>
      <AppHeader />
      <main className="container-app py-10">
        <PartidaDetalheClient />
      </main>
      <Footer />
    </>
  );
}
