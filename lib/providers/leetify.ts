import { ResolutionError } from "../errors";
import type {
  Ban,
  HltvSummary,
  PlayerLevels,
  PlayerMetrics,
  RecentMatch,
} from "../types";
import type { SourceStatus } from "../types";

const PUBLIC_BASE = "https://api-public.cs-prod.leetify.com";
const INTERNAL_BASE = "https://api.cs-prod.leetify.com";
const USER_AGENT = "StatsMan/0.1 (+https://github.com/luizhmmachado/statsman)";
const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry<T> = { expiresAt: number; value: T };
const profileCache = new Map<string, CacheEntry<LeetifyData | null>>();
const idCache = new Map<string, CacheEntry<{ steamId64: string; profileId: string } | null>>();

export type LeetifyData = {
  steamId64: string;
  profileId: string;
  name: string;
  privacyMode: string;
  levels: PlayerLevels;
  metrics: PlayerMetrics;
  hltv: HltvSummary | null;
  form: number[];
  recentMatches: RecentMatch[];
  mapWinrates: { mapName: string; winrate: number; matches: number }[];
  bans: Ban[];
};

type RawProfile = {
  steam64_id?: string;
  id?: string | null;
  name?: string;
  privacy_mode?: string;
  total_matches?: number;
  winrate?: number;
  ranks?: {
    leetify?: number | null;
    premier?: number | null;
    faceit?: number | null;
    faceit_elo?: number | null;
  };
  rating?: {
    aim?: number;
    positioning?: number;
    utility?: number;
    clutch?: number;
    opening?: number;
  };
  bans?: Array<{
    platform?: string;
    platform_nickname?: string;
    banned_since?: string;
  }>;
};

type RawStats = {
  total_kills?: number;
  total_deaths?: number;
  total_assists?: number;
  total_damage?: number;
  total_hs_kills?: number;
  dpr?: number;
  rounds_count?: number;
  rounds_won?: number;
  rounds_lost?: number;
  leetify_rating?: number;
  kd_ratio?: number;
};

type RawMatch = {
  id?: string;
  finished_at?: string;
  map_name?: string;
  data_source?: string;
  team_scores?: Array<{ team_number?: number; score?: number }>;
  stats?: Array<RawStats & { steam64_id?: string }>;
};

type RawHltvBatch = Array<{
  id?: string;
  mapName?: string;
  finishedAt?: string;
  playerStats?: Array<{
    steam64Id?: string;
    hltvRating?: number | null;
    hsp?: number | null;
  }>;
}>;

function authHeaders(usePublicKey: boolean): HeadersInit {
  const key = process.env.LEETIFY_API_KEY;
  if (usePublicKey && key) {
    return { Authorization: `Bearer ${key}` };
  }
  return {};
}

async function getJson<T>(
  url: string,
  options: { method?: "GET" | "POST"; body?: unknown; usePublicKey?: boolean; timeout?: number } = {},
): Promise<{ status: number; data: T | null }> {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
      ...authHeaders(options.usePublicKey ?? true),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(options.timeout ?? 8000),
    cache: "no-store",
  });

  if (response.status === 404) return { status: 404, data: null };
  if (!response.ok) {
    throw new ResolutionError(
      `A Leetify respondeu com HTTP ${response.status}.`,
      "provider_error",
    );
  }
  return { status: response.status, data: (await response.json()) as T };
}

function cached<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T): T {
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
  return value;
}

function fromCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

export async function resolveLeetifyId(
  leetifyId: string,
): Promise<{ steamId64: string; profileId: string } | null> {
  const cachedValue = fromCache(idCache, leetifyId);
  if (cachedValue !== undefined) return cachedValue;

  const { data } = await getJson<RawProfile>(
    `${PUBLIC_BASE}/v3/profile?id=${encodeURIComponent(leetifyId)}`,
  );
  if (!data?.steam64_id) {
    return cached(idCache, leetifyId, null);
  }
  return cached(idCache, leetifyId, {
    steamId64: data.steam64_id,
    profileId: data.id ?? leetifyId,
  });
}

export async function getLeetifyProfile(
  steamId64: string,
  options: { includeHltv?: boolean; matchLimit?: number } = {},
): Promise<{ data: LeetifyData | null; status: SourceStatus }> {
  const cacheKey = `${steamId64}:${options.includeHltv === false ? "basic" : "full"}`;
  const cachedValue = fromCache(profileCache, cacheKey);
  if (cachedValue !== undefined) {
    return { data: cachedValue, status: cachedValue ? "ok" : "not_found" };
  }

  try {
    const [profileResult, matchesResult] = await Promise.all([
      getJson<RawProfile>(
        `${PUBLIC_BASE}/v3/profile?steam64_id=${encodeURIComponent(steamId64)}`,
      ),
      getJson<RawMatch[]>(
        `${PUBLIC_BASE}/v3/profile/matches?steam64_id=${encodeURIComponent(steamId64)}`,
        { timeout: 10000 },
      ),
    ]);

    if (!profileResult.data) {
      cached(profileCache, cacheKey, null);
      return { data: null, status: "not_found" };
    }

    const profile = profileResult.data;
    const matches = (matchesResult.data ?? [])
      .filter((match) => match.id)
      .slice(0, Math.max(1, options.matchLimit ?? 10));

    const matchStats = matches.map((match) => ({
      match,
      stats: (match.stats ?? []).find((stat) => stat.steam64_id === steamId64),
    }));

    const validStats = matchStats
      .map((item) => item.stats)
      .filter((stats): stats is RawStats & { steam64_id?: string } => Boolean(stats));

    const kills = validStats.reduce((total, stats) => total + (stats.total_kills ?? 0), 0);
    const deaths = validStats.reduce((total, stats) => total + (stats.total_deaths ?? 0), 0);
    const damages = validStats
      .map((stats) => stats.dpr)
      .filter((value): value is number => typeof value === "number");
    const headshots = validStats.map((stats) => {
      if (!stats.total_kills) return null;
      return (stats.total_hs_kills ?? 0) / stats.total_kills;
    });

    const hltv = options.includeHltv === false
      ? null
      : await getHltvSummary(
          steamId64,
          matches.map((match) => match.id as string),
        );

    const recentMatches: RecentMatch[] = matchStats.map(({ match, stats }) => {
      const roundsWon = stats?.rounds_won ?? null;
      const roundsLost = stats?.rounds_lost ?? null;
      const hltvMatch = hltv?.perMatch.find((item) => item.matchId === match.id);
      return {
        id: match.id as string,
        mapName: match.map_name ?? "—",
        finishedAt: match.finished_at ?? null,
        outcome: null,
        kills: stats?.total_kills ?? null,
        deaths: stats?.total_deaths ?? null,
        assists: stats?.total_assists ?? null,
        adr: stats?.dpr ?? null,
        hltvRating: hltvMatch?.rating ?? null,
        leetifyRating: stats?.leetify_rating ?? null,
        won:
          roundsWon !== null && roundsLost !== null
            ? roundsWon > roundsLost
            : null,
      };
    });

    const form = recentMatches
      .map((match) => match.leetifyRating)
      .filter((value): value is number => typeof value === "number");

    const mapStats = new Map<string, { wins: number; matches: number }>();
    for (const { match, stats } of matchStats) {
      const map = match.map_name;
      if (!map || !stats) continue;
      const entry = mapStats.get(map) ?? { wins: 0, matches: 0 };
      entry.matches += 1;
      if (
        typeof stats.rounds_won === "number" &&
        typeof stats.rounds_lost === "number" &&
        stats.rounds_won > stats.rounds_lost
      ) {
        entry.wins += 1;
      }
      mapStats.set(map, entry);
    }

    const data: LeetifyData = {
      steamId64,
      profileId: profile.id ?? steamId64,
      name: profile.name ?? "Jogador",
      privacyMode: profile.privacy_mode ?? "unknown",
      levels: {
        leetify: profile.ranks?.leetify ?? null,
        premier: profile.ranks?.premier ?? null,
        faceit: profile.ranks?.faceit ?? null,
        faceitElo: profile.ranks?.faceit_elo ?? null,
        gamersClub: null,
      },
      metrics: {
        leetifyRating: profile.ranks?.leetify ?? null,
        aim: profile.rating?.aim ?? null,
        positioning: profile.rating?.positioning ?? null,
        utility: profile.rating?.utility ?? null,
        clutch: profile.rating?.clutch ?? null,
        opening: profile.rating?.opening ?? null,
        kd: deaths > 0 ? kills / deaths : null,
        adr: averageOf(damages),
        hs: averageOf(headshots),
        winrate: typeof profile.winrate === "number" ? profile.winrate : null,
        totalMatches: typeof profile.total_matches === "number" ? profile.total_matches : null,
      },
      hltv,
      form,
      recentMatches,
      mapWinrates: Array.from(mapStats.entries())
        .map(([mapName, value]) => ({
          mapName,
          winrate: value.matches ? value.wins / value.matches : 0,
          matches: value.matches,
        }))
        .sort((a, b) => b.matches - a.matches)
        .slice(0, 5),
      bans: (profile.bans ?? []).map((ban) => ({
        platform: ban.platform ?? "plataforma",
        nickname: ban.platform_nickname ?? null,
        bannedSince: ban.banned_since ?? null,
      })),
    };

    return { data: cached(profileCache, cacheKey, data), status: "ok" };
  } catch (error) {
    if (error instanceof ResolutionError) throw error;
    throw new ResolutionError("Não foi possível consultar a Leetify.", "provider_error");
  }
}

async function getHltvSummary(
  steamId64: string,
  matchIds: string[],
): Promise<HltvSummary | null> {
  if (matchIds.length === 0) return null;

  try {
    const { data } = await getJson<RawHltvBatch>(
      `${INTERNAL_BASE}/api/games/list-by-ids`,
      {
        method: "POST",
        body: { gameIds: matchIds.slice(0, 10), steam64Id: steamId64 },
        usePublicKey: false,
        timeout: 10000,
      },
    );
    if (!data || !Array.isArray(data)) return null;

    const perMatch = data
      .map((game) => {
        const stats = game.playerStats?.find((item) => item.steam64Id === steamId64);
        const rating = stats?.hltvRating;
        if (!game.id || typeof rating !== "number") return null;
        return {
          matchId: game.id,
          mapName: game.mapName ?? "—",
          finishedAt: game.finishedAt ?? null,
          rating,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (perMatch.length === 0) return null;

    const rating = averageOf(perMatch.map((item) => item.rating));
    return {
      rating,
      average: rating,
      matchesCount: perMatch.length,
      perMatch,
    };
  } catch {
    return null;
  }
}

function averageOf(values: Array<number | null | undefined>): number | null {
  const valid = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );
  if (valid.length === 0) return null;
  return valid.reduce((total, value) => total + value, 0) / valid.length;
}
