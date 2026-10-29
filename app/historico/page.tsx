import type { Metadata } from "next";
import { HistoryClient } from "./history-client";

export const metadata: Metadata = {
  title: "Histórico",
};

export default function HistoryPage() {
  return <HistoryClient />;
}
