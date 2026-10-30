"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Gamepad2, History, Settings, UserRound } from "lucide-react";
import { Brand } from "./Brand";
import { getMe } from "@/lib/storage";
import type { MeProfile } from "@/lib/types";

const nav = [
  { href: "/analisar", label: "Analisar", icon: BarChart3 },
  { href: "/partidas", label: "Partidas", icon: Gamepad2 },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function AppHeader() {
  const pathname = usePathname();
  const [me, setMe] = useState<MeProfile | null>(null);

  useEffect(() => {
    const load = () => setMe(getMe());
    load();
    window.addEventListener("statsman:me-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("statsman:me-updated", load);
      window.removeEventListener("storage", load);
    };
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/85 backdrop-blur-xl">
        <div className="container-app flex h-16 items-center justify-between gap-6">
          <Brand href="/analisar" />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-surface2 text-ink"
                      : "text-muted hover:bg-surface hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted sm:inline">
              Manual · CS2
            </span>
            <Link
              href="/configuracoes"
              className="focus-ring flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-1 transition-colors hover:border-primary/40 sm:pr-3"
            >
              {me?.avatarUrl ? (
                <img
                  src={me.avatarUrl}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-surface2 text-muted">
                  <UserRound size={15} />
                </span>
              )}
              <span className="hidden max-w-[120px] truncate text-xs text-ink sm:inline">
                {me?.name ?? "Conectar"}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        aria-label="Navegação"
      >
        <div className="grid grid-cols-4">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-wider transition-colors ${
                  active ? "text-primary" : "text-muted"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
