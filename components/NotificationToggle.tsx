"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { getNotificationsEnabled, setNotificationsEnabled } from "@/lib/storage";

export function NotificationToggle() {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      setSupported(typeof window !== "undefined" && "Notification" in window);
      if (typeof window !== "undefined" && "Notification" in window) {
        setPermission(Notification.permission);
      }
      setEnabled(getNotificationsEnabled());
    };
    load();
    window.addEventListener("statsman:settings-updated", load);
    return () => window.removeEventListener("statsman:settings-updated", load);
  }, []);

  const toggle = async () => {
    if (!supported) {
      setMessage("Este navegador não suporta notificações.");
      return;
    }

    if (enabled) {
      setEnabled(false);
      setNotificationsEnabled(false);
      setMessage("Notificações locais desativadas.");
      return;
    }

    let current = permission;
    if (current === "default") {
      current = await Notification.requestPermission();
      setPermission(current);
    }

    if (current !== "granted") {
      setMessage("Permissão negada. Libere as notificações nas configurações do navegador.");
      return;
    }

    setEnabled(true);
    setNotificationsEnabled(true);
    setMessage("Você será avisado quando uma análise terminar.");
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm text-ink">
            {enabled ? <Bell size={15} /> : <BellOff size={15} className="text-muted" />}
            Notificações locais
          </h3>
          <p className="mt-1 text-[11px] leading-5 text-muted">
            Um aviso quando a análise do lobby terminar. Nenhum dado sai do seu dispositivo
            para serviços de push.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={toggle}
          className={`relative mt-1 h-6 w-11 shrink-0 rounded-full border transition-colors ${
            enabled ? "border-primary/50 bg-primary/30" : "border-border bg-surface2"
          }`}
        >
          <span
            className={`absolute top-0.5 rounded-full transition-transform ${
              enabled ? "translate-x-[22px] bg-primary" : "translate-x-0.5 bg-muted"
            }`}
            style={{ height: 18, width: 18 }}
          />
        </button>
      </div>
      {message && <p className="mt-2 text-[10px] text-muted">{message}</p>}
    </div>
  );
}
