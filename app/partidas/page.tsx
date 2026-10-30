import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { PartidasClient } from "./partidas-client";

export const metadata = { title: "Partidas · StatsMan" };

export default function PartidasPage() {
  return (
    <>
      <AppHeader />
      <main className="container-app py-10">
        <PartidasClient />
      </main>
      <Footer />
    </>
  );
}
