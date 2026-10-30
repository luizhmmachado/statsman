import { ResolutionError } from "../errors";
import type { SourceStatus } from "../types";

const API_BASE = "https://api.gamersclub.com.br";
const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";
const CACHE_TTL_MS = 10 * 60 * 1000;

export type GamersClubData = {
  id: number | null;
  nickname: string;
  level: number | null;
  rating: number | null;
  avatarUrl: string | null;
  steamId64: string;
};

type CacheEntry<T> = { expiresAt: number; value: T };
const cache = new Map<string, CacheEntry<GamersClubData | null>>();

function cached<T>(map: Map<string, CacheEntry<T>>, key: string, value: T): T {
  map.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
  return value;
}

function fromCache<T>(map: Map<string, CacheEntry<T>>, key: string): T | undefined {
  const entry = map.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    map.delete(key);
    return undefined;
  }
  return entry.value;
}

export async function resolveGamersClubId(profileId: string): Promise<string> {
  const response = await fetch(`https://gamersclub.com.br/player/${encodeURIComponent(profileId)}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ResolutionError(
      `Não encontramos o perfil GamersClub "${profileId}".`,
      "not_found",
    );
  }

  const html = await response.text();
  const match = html.match(/steamcommunity\.com\/profiles\/(\d{17})/);
  if (!match) {
    throw new ResolutionError(
      "O perfil GamersClub não expõe a Steam publicamente. Use o link da Steam.",
      "not_found",
    );
  }
  return match[1];
}

export async function getGamersClub(
  steamId64: string,
): Promise<{ data: GamersClubData | null; status: SourceStatus }> {
  const cachedValue = fromCache(cache, steamId64);
  if (cachedValue !== undefined) {
    return { data: cachedValue, status: cachedValue ? "ok" : "not_found" };
  }

  try {
    const path = `/v1/user/steam/${encodeURIComponent(steamId64)}`;
    const headers = {
      "User-Agent": USER_AGENT,
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      Referer: "https://gamersclub.com.br/",
      Origin: "https://gamersclub.com.br",
      "Sec-Fetch-Site": "same-site",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
    };

    let response = await fetch(`${API_BASE}${path}`, {
      headers,
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });

    if (response.status === 403 || response.status === 429) {
      const translated = await fetch(
        `https://api-gamersclub-com-br.translate.goog${path}?_x_tr_sl=auto&_x_tr_tl=pt&_x_tr_hl=pt`,
        { headers, signal: AbortSignal.timeout(8000), cache: "no-store" },
      );
      console.error("[gamersclub] proxy", response.status, translated.status);
      if (translated.ok) response = translated;
    }

    if (response.status === 404) {
      cached(cache, steamId64, null);
      return { data: null, status: "not_found" };
    }
    if (!response.ok) {
      throw new ResolutionError(
        `A GamersClub respondeu com HTTP ${response.status}.`,
        "provider_error",
      );
    }

    const raw = (await response.json()) as {
      id?: number;
      nick?: string;
      name?: string;
      level?: number;
      rating?: number;
      avatar?: string;
      steamid?: string;
    };

    const data: GamersClubData = {
      id: typeof raw.id === "number" ? raw.id : null,
      nickname: raw.nick ?? raw.name ?? "Jogador",
      level: typeof raw.level === "number" ? raw.level : null,
      rating: typeof raw.rating === "number" ? raw.rating : null,
      avatarUrl: raw.avatar ?? null,
      steamId64: raw.steamid ?? steamId64,
    };

    return { data: cached(cache, steamId64, data), status: "ok" };
  } catch (error) {
    if (error instanceof ResolutionError) throw error;
    throw new ResolutionError("Não foi possível consultar a GamersClub.", "provider_error");
  }
}
