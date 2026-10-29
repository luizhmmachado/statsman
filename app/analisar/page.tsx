import type { Metadata } from "next";
import { AnalyzeClient } from "./analyze-client";

export const metadata: Metadata = {
  title: "Analisar lobby",
  description: "Cole os perfis do lobby e compare com o seu perfil de CS2.",
};

export default function AnalyzePage() {
  return <AnalyzeClient />;
}
