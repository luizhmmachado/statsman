import type { AnalysisResult, HistoryEntry, MeProfile } from "./types";

const ME_KEY = "statsman:me:v1";
const HISTORY_KEY = "statsman:history:v1";
const LAST_KEY = "statsman:last-result:v1";
const NOTIFY_KEY = "statsman:notify:v1";

function hasStorage(): boolean {
  return typeof window !== "undefined";
}

function read<T>(storage: Storage, key: string): T | null {
  try {
    const value = storage.getItem(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function write(storage: Storage, key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

export function getMe(): MeProfile | null {
  if (!hasStorage()) return null;
  return read<MeProfile>(window.localStorage, ME_KEY);
}

export function saveMe(profile: MeProfile): void {
  if (!hasStorage()) return;
  write(window.localStorage, ME_KEY, profile);
}

export function clearMe(): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(ME_KEY);
}

export function getHistory(): HistoryEntry[] {
  if (!hasStorage()) return [];
  return read<HistoryEntry[]>(window.localStorage, HISTORY_KEY) ?? [];
}

export function saveHistoryEntry(entry: HistoryEntry): void {
  if (!hasStorage()) return;
  const history = getHistory().filter((item) => item.id !== entry.id);
  write(window.localStorage, HISTORY_KEY, [entry, ...history].slice(0, 20));
}

export function removeHistoryEntry(id: string): void {
  if (!hasStorage()) return;
  write(
    window.localStorage,
    HISTORY_KEY,
    getHistory().filter((item) => item.id !== id),
  );
}

export function clearHistory(): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(HISTORY_KEY);
}

export function getLastResult(): AnalysisResult | null {
  if (!hasStorage()) return null;
  return read<AnalysisResult>(window.sessionStorage, LAST_KEY);
}

export function saveLastResult(result: AnalysisResult): void {
  if (!hasStorage()) return;
  write(window.sessionStorage, LAST_KEY, result);
}

export function getNotificationsEnabled(): boolean {
  if (!hasStorage()) return false;
  try {
    return window.localStorage.getItem(NOTIFY_KEY) === "true";
  } catch {
    return false;
  }
}

export function setNotificationsEnabled(enabled: boolean): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(NOTIFY_KEY, enabled ? "true" : "false");
  } catch {
    return;
  }
}
