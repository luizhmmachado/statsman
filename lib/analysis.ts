import { average } from "./format";
import { mapLimit } from "./concurrency";
import { ResolutionError, errorMessage } from "./errors";
import { parsePlayerInput, type ParsedInput } from "./parsers";
import { getGamersClub, resolveGamersClubId } from "./providers/gamersclub";
import { getFaceitBySteamId, resolveFaceitNickname } from "./providers/faceit";
import { getLeetifyProfile, resolveLeetifyId } from "./providers/leetify";
import { resolveSteam, type SteamProfile } from "./providers/steam";
import { computeThreat } from "./threat";
import type {
  AnalysisResult,
  LobbyAverage,
  PlayerAnalysis,
  PlayerMetrics,
  SourceState,
  SourceStatus,
  Team,
} from "./types";

export type PlayerRequest = { input: string; team: Team };

async function resolveToSteam(parsed: ParsedInput): Promise<{
  steamId64: string;
  profile: SteamProfile | null;
  steamStatus: SourceStatus;
}> {
  if (parsed.kind === "leetify-id") {
    const resolved = await resolveLeetifyId(parsed.value);
    if (!resolved) {
      throw new ResolutionError(
        `Não encontramos o perfil Leetify "${parsed.value}".`,
        "not_found",
      );
    }
    const steam = await resolveSteam({
      kind: "steamid64",
      value: resolved.steamId64,
      raw: parsed.raw,
    });
    return { steamId64: steam.steamId64, profile: steam.profile, steamStatus: steam.status };
  }

  if (parsed.kind === "leetify-steam") {
    const steam = await resolveSteam({
      kind: "steamid64",
      value: parsed.value,
      raw: parsed.raw,
    });
    return { steamId64: steam.steamId64, profile: steam.profile, steamStatus: steam.status };
  }

  if (parsed.kind === "faceit") {
    const steamId64 = await resolveFaceitNickname(parsed.value);
    const steam = await resolveSteam({ kind: "steamid64", value: steamId64, raw: parsed.raw });
    return { steamId64, profile: steam.profile, steamStatus: steam.status };
  }

  if (parsed.kind === "gamersclub") {
    const steamId64 = await resolveGamersClubId(parsed.value);
    const steam = await resolveSteam({ kind: "steamid64", value: steamId64, raw: parsed.raw });
    return { steamId64, profile: steam.profile, steamStatus: steam.status };
  }

  const steam = await resolveSteam(parsed);
  return { steamId64: steam.steamId64, profile: steam.profile, steamStatus: steam.status };
}

function mergeMetrics(
  leetify: Partial<PlayerMetrics> | null,
  faceit: Partial<PlayerMetrics> | null,
): PlayerMetrics {
  return {
    leetifyRating: leetify?.leetifyRating ?? null,
    aim: leetify?.aim ?? null,
    positioning: leetify?.positioning ?? null,
    utility: leetify?.utility ?? null,
    clutch: leetify?.clutch ?? null,
    opening: leetify?.opening ?? null,
    kd: leetify?.kd ?? faceit?.kd ?? null,
    adr: leetify?.adr ?? faceit?.adr ?? null,
    hs: leetify?.hs ?? faceit?.hs ?? null,
    winrate: leetify?.winrate ?? faceit?.winrate ?? null,
    totalMatches: leetify?.totalMatches ?? faceit?.totalMatches ?? null,
  };
}

export async function resolvePlayer(
  request: PlayerRequest,
  options: { includeHltv?: boolean } = {},
): Promise<PlayerAnalysis> {
  const parsed = parsePlayerInput(request.input);
  if (!parsed) {
    throw new ResolutionError(`Link inválido: "${request.input}".`, "invalid_input");
  }

  const { steamId64, profile: steamProfile, steamStatus } = await resolveToSteam(parsed);

  const [leetifyResult, gamersClubResult, faceitResult] = await Promise.all([
    getLeetifyProfile(steamId64, { includeHltv: options.includeHltv ?? true })
      .then((result) => ({ ...result, failed: false }))
      .catch(() => ({ data: null, status: "error" as SourceStatus, failed: true })),
    getGamersClub(steamId64)
      .then((result) => ({ ...result, failed: false }))
      .catch(() => ({ data: null, status: "error" as SourceStatus, failed: true })),
    getFaceitBySteamId(steamId64)
      .then((result) => ({ ...result, failed: false }))
      .catch(() => ({ data: null, status: "error" as SourceStatus, failed: true })),
  ]);

  const leetify = leetifyResult.data;
  const faceit = faceitResult.data;
  const gamersClub = gamersClubResult.data;

  const steam = steamProfile;
  const name =
    steam?.name ||
    leetify?.name ||
    faceit?.nickname ||
    gamersClub?.nickname ||
    "Jogador";
  const avatarUrl =
    steam?.avatarUrl || faceit?.avatarUrl || gamersClub?.avatarUrl || null;

  const sources: SourceState = {
    steam: steamStatus,
    leetify: leetifyResult.status,
    hltv:
      leetify?.hltv
        ? "ok"
        : leetifyResult.status === "ok"
          ? "not_found"
          : leetifyResult.status === "error"
            ? "error"
            : "not_found",
    gamersClub: gamersClubResult.status,
    faceit: faceitResult.status,
  };

  const levels = {
    leetify: leetify?.levels.leetify ?? null,
    premier: leetify?.levels.premier ?? null,
    faceit: leetify?.levels.faceit ?? faceit?.level ?? null,
    faceitElo: leetify?.levels.faceitElo ?? faceit?.elo ?? null,
    gamersClub: gamersClub?.level ?? null,
  };

  const player: PlayerAnalysis = {
    input: request.input.trim(),
    steamId64,
    name,
    avatarUrl,
    country: faceit?.country ?? null,
    team: request.team,
    levels,
    metrics: mergeMetrics(leetify?.metrics ?? null, faceit?.metrics ?? null),
    hltv: leetify?.hltv ?? null,
    form: leetify?.form ?? [],
    recentMatches: leetify?.recentMatches ?? [],
    mapWinrates: leetify?.mapWinrates ?? [],
    bans: leetify?.bans ?? [],
    links: {
      steam: `https://steamcommunity.com/profiles/${steamId64}`,
      leetify: leetify ? `https://leetify.com/app/profile/${leetify.profileId}` : null,
      faceit: faceit ? `https://www.faceit.com/en/players/${faceit.nickname}` : null,
      gamersClub: gamersClub?.id
        ? `https://gamersclub.com.br/player/${gamersClub.id}`
        : null,
    },
    sources,
    threat: null,
  };

  return player;
}

function buildWarnings(players: PlayerAnalysis[]): string[] {
  const warnings: string[] = [];

  for (const player of players) {
    if (player.sources.leetify === "not_found") {
      warnings.push(`${player.name}: sem perfil público na Leetify.`);
    } else if (player.sources.leetify === "error") {
      warnings.push(`${player.name}: a Leetify não respondeu.`);
    }

    if (player.sources.gamersClub === "error") {
      warnings.push(`${player.name}: a GamersClub não respondeu.`);
    }

    if (player.sources.hltv !== "ok") {
      warnings.push(`${player.name}: HLTV Rating indisponível.`);
    }

    if (player.sources.steam === "error") {
      warnings.push(`${player.name}: perfil Steam privado ou indisponível.`);
    }
  }

  return Array.from(new Set(warnings));
}

function lobbyAverage(enemies: PlayerAnalysis[]): LobbyAverage {
  const pool = enemies.length > 0 ? enemies : [];
  return {
    leetify: average(pool.map((player) => player.metrics.leetifyRating)),
    aim: average(pool.map((player) => player.metrics.aim)),
    adr: average(pool.map((player) => player.metrics.adr)),
    winrate: average(pool.map((player) => player.metrics.winrate)),
  };
}

export async function analyzeLobby(input: {
  meInput: string;
  players: PlayerRequest[];
}): Promise<AnalysisResult> {
  const meRequest = { input: input.meInput, team: "me" as Team };
  const others = input.players.filter((player) => player.input.trim().length > 0);

  if (others.length > 9) {
    throw new ResolutionError("O lobby aceita no máximo 10 jogadores (incluindo você).", "invalid_input");
  }

  const me = await resolvePlayer(meRequest, { includeHltv: true });

  const settled = await mapLimit(others, 3, async (request) => {
    try {
      const player = await resolvePlayer(request, { includeHltv: true });
      return { ok: true as const, player };
    } catch (error) {
      return { ok: false as const, input: request.input, message: errorMessage(error) };
    }
  });

  const failures = settled.filter((item) => !item.ok);
  if (failures.length > 0) {
    const details = failures
      .map((item) => (item.ok ? "" : `${item.input}: ${item.message}`))
      .join(" | ");
    throw new ResolutionError(details, "not_found");
  }

  const resolved = settled
    .filter((item): item is { ok: true; player: PlayerAnalysis } => item.ok)
    .map((item) => item.player);

  const bySteamId = new Map<string, PlayerAnalysis>();
  bySteamId.set(me.steamId64, me);
  for (const player of resolved) {
    if (bySteamId.has(player.steamId64)) continue;
    bySteamId.set(player.steamId64, player);
  }

  const players = Array.from(bySteamId.values()).slice(0, 10);
  const meFinal = players.find((player) => player.steamId64 === me.steamId64) as PlayerAnalysis;

  for (const player of players) {
    if (player.steamId64 !== meFinal.steamId64) {
      player.threat = computeThreat(player, meFinal);
    }
  }

  const enemies = players.filter((player) => player.team === "enemy");
  const warnings = buildWarnings(players);
  const partial = players.some(
    (player) =>
      player.sources.leetify === "error" ||
      player.sources.leetify === "not_found" ||
      player.sources.gamersClub === "error" ||
      player.sources.hltv === "error" ||
      player.sources.steam === "error",
  );

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    mode: "Manual · CS2",
    mapName: null,
    meSteamId: meFinal.steamId64,
    players,
    lobbyAverage: lobbyAverage(enemies),
    partial,
    warnings,
  };
}
