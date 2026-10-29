"use client";

import { useEffect, useState } from "react";
import { Download, MonitorDown } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallButton() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (installed) {
      setHint(true);
      return;
    }
    if (!promptEvent) {
      setHint(true);
      return;
    }
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setPromptEvent(null);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="flex items-center gap-2 text-sm text-ink">
        <MonitorDown size={15} />
        Instalar como app
      </h3>
      <p className="mt-1 text-[11px] leading-5 text-muted">
        Adicione o StatsMan à tela inicial e abra em tela cheia, sem barra do navegador.
      </p>
      <button type="button" onClick={install} className="btn-secondary mt-3">
        <Download size={14} />
        {installed ? "App instalado" : "Instalar StatsMan"}
      </button>
      {hint && !installed && !promptEvent && (
        <p className="mt-2 text-[10px] leading-4 text-muted">
          No Chrome/Edge, use o menu do navegador → “Instalar aplicativo”. No iPhone, use
          Compartilhar → “Adicionar à Tela de Início”.
        </p>
      )}
    </div>
  );
}
