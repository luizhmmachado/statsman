import { average } from "./format";
import { computeThreat } from "./threat";
import type { AnalysisResult, PlayerAnalysis, RecentMatch, Team } from "./types";

const SOURCES = {
  steam: "ok",
  leetify: "ok",
  hltv: "ok",
  gamersClub: "ok",
  faceit: "ok",
} as const;

function matches(
  maps: string[],
  ratings: number[],
  base: { kills: number; deaths: number; assists: number; adr: number },
): RecentMatch[] {
  return maps.map((mapName, index) => {
    const won = index % 3 !== 1;
    return {
      id: `demo-${mapName}-${index}`,
      mapName,
      finishedAt: new Date(Date.UTC(2026, 9, 28 - index, 20, 15)).toISOString(),
      outcome: won ? "won" : "lost",
      kills: base.kills + (index % 3) * 2,
      deaths: base.deaths + (index % 2),
      assists: base.assists + (index % 2),
      adr: base.adr + index - 1,
      hltvRating: ratings[index] ?? null,
      leetifyRating: (ratings[index] ?? 0) - 1,
      won,
    };
  });
}

function player(config: {
  name: string;
  id: string;
  team: Team;
  gc: number;
  faceit: number;
  elo: number;
  leetify: number;
  aim: number;
  positioning: number;
  utility: number;
  clutch: number;
  opening: number;
  kd: number;
  adr: number;
  hs: number;
  winrate: number;
  totalMatches: number;
  hltv: number;
  form: number[];
  maps: { mapName: string; winrate: number; matches: number }[];
}): PlayerAnalysis {
  const hltvMatches = config.form.map((value, index) => ({
    matchId: `${config.id}-${index}`,
    mapName: ["Mirage", "Inferno", "Ancient"][index % 3],
    finishedAt: new Date(Date.UTC(2026, 9, 28 - index, 19, 0)).toISOString(),
    rating: Number((config.hltv + value).toFixed(2)),
  }));

  return {
    input: config.id,
    steamId64: config.id,
    name: config.name,
    avatarUrl: null,
    country: "BR",
    team: config.team,
    levels: {
      leetify: Math.max(1, Math.round(config.leetify * 20 + 6)),
      premier: Math.round(12000 + config.hltv * 4000),
      faceit: config.faceit,
      faceitElo: config.elo,
      gamersClub: config.gc,
    },
    metrics: {
      leetifyRating: config.leetify,
      aim: config.aim,
      positioning: config.positioning,
      utility: config.utility,
      clutch: config.clutch,
      opening: config.opening,
      kd: config.kd,
      adr: config.adr,
      hs: config.hs,
      winrate: config.winrate,
      totalMatches: config.totalMatches,
    },
    hltv: {
      rating: config.hltv,
      average: config.hltv,
      matchesCount: 10,
      perMatch: hltvMatches,
    },
    form: config.form,
    recentMatches: matches(
      ["Mirage", "Inferno", "Ancient"],
      hltvMatches.map((match) => match.rating),
      {
        kills: Math.round(config.kd * 18),
        deaths: 18,
        assists: 4,
        adr: config.adr,
      },
    ),
    mapWinrates: config.maps,
    bans: [],
    links: {
      steam: `https://steamcommunity.com/profiles/${config.id}`,
      leetify: `https://leetify.com/app/profile/${config.id}`,
      faceit: `https://www.faceit.com/en/players/${config.name}`,
      gamersClub: `https://gamersclub.com.br/player/${config.name}`,
    },
    sources: { ...SOURCES },
    threat: null,
  };
}

const me = player({
  name: "frost",
  id: "76561198000000001",
  team: "me",
  gc: 17,
  faceit: 7,
  elo: 2184,
  leetify: 0.08,
  aim: 62,
  positioning: 58,
  utility: 66,
  clutch: 0.06,
  opening: 0.02,
  kd: 1.14,
  adr: 82,
  hs: 0.48,
  winrate: 0.54,
  totalMatches: 412,
  hltv: 1.09,
  form: [0.12, -0.04, 0.08, 0.21, -0.11, 0.16, 0.03, 0.09, -0.02, 0.14],
  maps: [
    { mapName: "Mirage", winrate: 0.58, matches: 64 },
    { mapName: "Inferno", winrate: 0.52, matches: 51 },
    { mapName: "Ancient", winrate: 0.49, matches: 38 },
  ],
});

const others = [
  player({
    name: "vLkzz",
    id: "76561198000000002",
    team: "enemy",
    gc: 19,
    faceit: 8,
    elo: 2416,
    leetify: 0.21,
    aim: 71,
    positioning: 64,
    utility: 61,
    clutch: 0.09,
    opening: 0.041,
    kd: 1.31,
    adr: 94,
    hs: 0.52,
    winrate: 0.61,
    totalMatches: 689,
    hltv: 1.24,
    form: [0.28, 0.11, -0.03, 0.24, 0.19, -0.08, 0.31, 0.16, 0.05, 0.22],
    maps: [
      { mapName: "Mirage", winrate: 0.66, matches: 88 },
      { mapName: "Inferno", winrate: 0.59, matches: 71 },
      { mapName: "Nuke", winrate: 0.62, matches: 49 },
    ],
  }),
  player({
    name: "brunão",
    id: "76561198000000003",
    team: "enemy",
    gc: 16,
    faceit: 6,
    elo: 1972,
    leetify: 0.11,
    aim: 64,
    positioning: 59,
    utility: 55,
    clutch: 0.07,
    opening: 0.018,
    kd: 1.18,
    adr: 85,
    hs: 0.49,
    winrate: 0.56,
    totalMatches: 534,
    hltv: 1.13,
    form: [-0.06, 0.14, 0.09, 0.02, 0.18, -0.12, 0.07, 0.11, 0.04, -0.03],
    maps: [
      { mapName: "Mirage", winrate: 0.57, matches: 62 },
      { mapName: "Vertigo", winrate: 0.52, matches: 40 },
      { mapName: "Inferno", winrate: 0.55, matches: 57 },
    ],
  }),
  player({
    name: "t4co",
    id: "76561198000000004",
    team: "enemy",
    gc: 18,
    faceit: 7,
    elo: 2210,
    leetify: 0.14,
    aim: 66,
    positioning: 61,
    utility: 54,
    clutch: 0.08,
    opening: 0.032,
    kd: 1.22,
    adr: 88,
    hs: 0.55,
    winrate: 0.58,
    totalMatches: 601,
    hltv: 1.17,
    form: [0.05, 0.21, -0.09, 0.12, 0.08, 0.17, -0.02, 0.13, 0.06, 0.1],
    maps: [
      { mapName: "Ancient", winrate: 0.61, matches: 54 },
      { mapName: "Mirage", winrate: 0.54, matches: 69 },
      { mapName: "Overpass", winrate: 0.57, matches: 33 },
    ],
  }),
  player({
    name: "s0l",
    id: "76561198000000005",
    team: "enemy",
    gc: 15,
    faceit: 6,
    elo: 1888,
    leetify: 0.05,
    aim: 58,
    positioning: 57,
    utility: 59,
    clutch: 0.05,
    opening: 0.011,
    kd: 1.09,
    adr: 79,
    hs: 0.46,
    winrate: 0.51,
    totalMatches: 347,
    hltv: 1.05,
    form: [0.02, -0.08, 0.11, 0.04, -0.03, 0.09, 0.01, -0.05, 0.12, 0.03],
    maps: [
      { mapName: "Inferno", winrate: 0.5, matches: 44 },
      { mapName: "Mirage", winrate: 0.53, matches: 48 },
      { mapName: "Anubis", winrate: 0.47, matches: 29 },
    ],
  }),
  player({
    name: "k1ngz",
    id: "76561198000000006",
    team: "enemy",
    gc: 14,
    faceit: 5,
    elo: 1704,
    leetify: -0.02,
    aim: 51,
    positioning: 54,
    utility: 62,
    clutch: 0.04,
    opening: -0.006,
    kd: 1.01,
    adr: 74,
    hs: 0.44,
    winrate: 0.48,
    totalMatches: 256,
    hltv: 0.98,
    form: [-0.05, 0.03, -0.11, 0.06, 0.01, -0.04, 0.08, -0.02, 0.04, -0.07],
    maps: [
      { mapName: "Nuke", winrate: 0.45, matches: 38 },
      { mapName: "Mirage", winrate: 0.49, matches: 42 },
      { mapName: "Ancient", winrate: 0.46, matches: 31 },
    ],
  }),
  player({
    name: "nina",
    id: "76561198000000007",
    team: "ally",
    gc: 16,
    faceit: 6,
    elo: 1904,
    leetify: 0.03,
    aim: 56,
    positioning: 60,
    utility: 64,
    clutch: 0.05,
    opening: -0.002,
    kd: 1.05,
    adr: 76,
    hs: 0.47,
    winrate: 0.52,
    totalMatches: 389,
    hltv: 1.02,
    form: [0.04, -0.02, 0.07, 0.01, -0.06, 0.09, 0.03, -0.01, 0.05, 0.02],
    maps: [
      { mapName: "Mirage", winrate: 0.54, matches: 56 },
      { mapName: "Inferno", winrate: 0.51, matches: 49 },
      { mapName: "Ancient", winrate: 0.48, matches: 36 },
    ],
  }),
  player({
    name: "duds",
    id: "76561198000000008",
    team: "ally",
    gc: 17,
    faceit: 7,
    elo: 2098,
    leetify: 0.1,
    aim: 63,
    positioning: 55,
    utility: 58,
    clutch: 0.07,
    opening: 0.022,
    kd: 1.16,
    adr: 84,
    hs: 0.51,
    winrate: 0.55,
    totalMatches: 498,
    hltv: 1.1,
    form: [0.11, 0.02, -0.04, 0.14, 0.07, 0.19, -0.01, 0.06, 0.12, 0.03],
    maps: [
      { mapName: "Mirage", winrate: 0.58, matches: 67 },
      { mapName: "Vertigo", winrate: 0.53, matches: 35 },
      { mapName: "Inferno", winrate: 0.5, matches: 52 },
    ],
  }),
  player({
    name: "pedr0",
    id: "76561198000000009",
    team: "ally",
    gc: 13,
    faceit: 5,
    elo: 1622,
    leetify: -0.04,
    aim: 49,
    positioning: 53,
    utility: 57,
    clutch: 0.03,
    opening: -0.012,
    kd: 0.96,
    adr: 70,
    hs: 0.42,
    winrate: 0.46,
    totalMatches: 212,
    hltv: 0.94,
    form: [-0.08, -0.02, 0.04, -0.11, 0.01, -0.05, 0.06, -0.03, -0.07, 0.02],
    maps: [
      { mapName: "Inferno", winrate: 0.44, matches: 31 },
      { mapName: "Mirage", winrate: 0.47, matches: 39 },
      { mapName: "Dust2", winrate: 0.43, matches: 27 },
    ],
  }),
];

for (const item of others) {
  item.threat = computeThreat(item, me);
}

const players = [me, ...others];
const enemies = players.filter((item) => item.team === "enemy");

export const demoResult: AnalysisResult = {
  id: "demo-8f2a1c",
  createdAt: "2026-10-29T18:30:00.000Z",
  mode: "Exemplo · CS2",
  mapName: "Mirage",
  meSteamId: me.steamId64,
  players,
  lobbyAverage: {
    leetify: average(enemies.map((item) => item.metrics.leetifyRating)),
    aim: average(enemies.map((item) => item.metrics.aim)),
    adr: average(enemies.map((item) => item.metrics.adr)),
    winrate: average(enemies.map((item) => item.metrics.winrate)),
  },
  partial: false,
  warnings: [],
};
