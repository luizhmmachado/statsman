import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { PartidaDetalheClient } from "./partida-detalhe-client";

export default async function PartidaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <AppHeader />
      <main className="container-app py-10">
        <PartidaDetalheClient id={id} />
      </main>
      <Footer />
    </>
  );
}
