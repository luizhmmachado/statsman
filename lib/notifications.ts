import { getNotificationsEnabled } from "./storage";

export async function notifyAnalysisReady(resultId: string, threats: number): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (!getNotificationsEnabled()) return;
  if (Notification.permission !== "granted") return;

  try {
    const registration = await navigator.serviceWorker?.ready;
    const body =
      threats > 0
        ? `Análise do lobby pronta: ${threats} adversário(s) com ameaça alta.`
        : "Análise do lobby pronta.";
    if (registration) {
      await registration.showNotification("StatsMan", {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: `statsman-${resultId}`,
        data: { url: "/resultado" },
      });
    } else {
      new Notification("StatsMan", { body, icon: "/icons/icon-192.png" });
    }
  } catch {
    return;
  }
}
