import type { Metadata } from "next";
import { ResultClient } from "./result-client";

export const metadata: Metadata = {
  title: "Resultado da análise",
};

export default function ResultPage() {
  return <ResultClient />;
}
