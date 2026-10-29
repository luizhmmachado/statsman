import { ResolutionError } from "../errors";
import type { PlayerMetrics, SourceStatus } from "../types";

const BASE = "https://open.faceit.com/data/v4";
const CACHE_TTL_MS = 10 * 60 * 1000;

export type FaceitData = {
  playerId: string;
  nickname: string;
  avatarUrl: string | null;
  country: string | null;
  level: number | null;
  elo: number | null;
  steamId64: string | null;
  metrics: Partial<PlayerMetrics>;
};

type RawPlayer = {
  player_id?: string;
  nickname?: string;
  avatar?: string;
  country?: string;
  steam_id_64?: string;
  platforms?: {
    steam?: { platform_id?: string };
  };
  games?: {
    cs2?: {
      skill_level?: number;
      faceit_elo?: number;
      game_player_id?: string;
    };
  };
};

type CacheEntry<T> = { expiresAt: number; value: T };
const cache = new Map<string, CacheEntry<FaceitData | null>>();

function apiKey(): string | null {
  return process.env.FACEIT_API_KEY?.trim() || null;
}

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

async function faceitGet<T>(path: string): Promise<{ status: number; data: T | null }> {
  const key = apiKey();
  if (!key) throw new ResolutionError("FACEIT_API_KEY não configurada.", "missing_key");

  const response = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(7000),
    cache: "no-store",
  });

  if (response.status === 404) return { status: 404, data: null };
  if (!response.ok) {
    throw new ResolutionError(
      `A FACEIT respondeu com HTTP ${response.status}.`,
      "provider_error",
    );
  }
  return { status: response.status, data: (await response.json()) as T };
}

function numberOrNull(value: unknown): number | null {
  const number = typeof value === "string" ? Number(value) : value;
  return typeof number === "number" && Number.isFinite(number) ? number : null;
}

function steamIdFromPlayer(player: RawPlayer): string | null {
  return (
    player.platforms?.steam?.platform_id ??
    player.steam_id_64 ??
    player.games?.cs2?.game_player_id ??
    null
  );
}

async function enrichWithStats(player: RawPlayer): Promise<Partial<PlayerMetrics>> {
  if (!player.player_id) return {};
  try {
    const { data } = await faceitGet<{
      lifetime?: Record<string, string | number>;
    }>(`/players/${player.player_id}/stats/cs2`);
    const lifetime = data?.lifetime;
    if (!lifetime) return {};

    const hsPercent = numberOrNull(
      lifetime["Average Headshots %"] ?? lifetime["Headshots %"],
    );
    const winPercent = numberOrNull(lifetime["Win Rate %"]);
    const adr = numberOrNull(lifetime.ADR) ??
      numberOrNull(lifetime["Average Damage per Round"]);

    return {
      kd: numberOrNull(lifetime["Average K/D Ratio"] ?? lifetime["K/D Ratio"]),
      hs: hsPercent === null ? null : hsPercent / 100,
      winrate: winPercent === null ? null : winPercent / 100,
      adr,
      totalMatches: numberOrNull(lifetime.Matches),
    };
  } catch {
    return {};
  }
}

async function toData(player: RawPlayer): Promise<FaceitData> {
  const metrics = await enrichWithStats(player);
  return {
    playerId: player.player_id ?? "",
    nickname: player.nickname ?? "Jogador",
    avatarUrl: player.avatar ?? null,
    country: player.country ?? null,
    level: numberOrNull(player.games?.cs2?.skill_level),
    elo: numberOrNull(player.games?.cs2?.faceit_elo),
    steamId64: steamIdFromPlayer(player),
    metrics,
  };
}

export async function getFaceitBySteamId(
  steamId64: string,
): Promise<{ data: FaceitData | null; status: SourceStatus }> {
  if (!apiKey()) return { data: null, status: "not_configured" };

  const cachedValue = fromCache(cache, `steam:${steamId64}`);
  if (cachedValue !== undefined) {
    return { data: cachedValue, status: cachedValue ? "ok" : "not_found" };
  }

  try {
    const { data } = await faceitGet<RawPlayer>(
      `/players?game=cs2&game_player_id=${encodeURIComponent(steamId64)}`,
    );
    if (!data) {
      cached(cache, `steam:${steamId64}`, null);
      return { data: null, status: "not_found" };
    }
    const normalized = await toData(data);
    return { data: cached(cache, `steam:${steamId64}`, normalized), status: "ok" };
  } catch (error) {
    if (error instanceof ResolutionError) throw error;
    throw new ResolutionError("Não foi possível consultar a FACEIT.", "provider_error");
  }
}

export async function resolveFaceitNickname(nickname: string): Promise<string> {
  if (!apiKey()) {
    throw new ResolutionError(
      "Para usar links da FACEIT, configure FACEIT_API_KEY no servidor. Você também pode colar o link da Steam.",
      "missing_key",
    );
  }

  const { data } = await faceitGet<RawPlayer>(
    `/players?nickname=${encodeURIComponent(nickname)}`,
  );
  const steamId64 = data ? steamIdFromPlayer(data) : null;
  if (!steamId64) {
    throw new ResolutionError(
      `Não encontramos a Steam do jogador FACEIT "${nickname}". Use o link da Steam.`,
      "not_found",
    );
  }
  return steamId64;
}
