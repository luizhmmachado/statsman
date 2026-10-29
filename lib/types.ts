export type Team = "me" | "ally" | "enemy";

export type SourceStatus = "ok" | "not_found" | "error" | "not_configured";

export type SourceState = {
  steam: SourceStatus;
  leetify: SourceStatus;
  hltv: SourceStatus;
  gamersClub: SourceStatus;
  faceit: SourceStatus;
};

export type RecentMatch = {
  id: string;
  mapName: string;
  finishedAt: string | null;
  outcome: string | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  adr: number | null;
  hltvRating: number | null;
  leetifyRating: number | null;
  won: boolean | null;
};

export type HltvMatch = {
  matchId: string;
  mapName: string;
  finishedAt: string | null;
  rating: number;
};

export type HltvSummary = {
  rating: number | null;
  average: number | null;
  matchesCount: number;
  perMatch: HltvMatch[];
};

export type Ban = {
  platform: string;
  nickname: string | null;
  bannedSince: string | null;
};

export type PlayerLevels = {
  leetify: number | null;
  premier: number | null;
  faceit: number | null;
  faceitElo: number | null;
  gamersClub: number | null;
};

export type PlayerMetrics = {
  leetifyRating: number | null;
  aim: number | null;
  positioning: number | null;
  utility: number | null;
  clutch: number | null;
  opening: number | null;
  kd: number | null;
  adr: number | null;
  hs: number | null;
  winrate: number | null;
  totalMatches: number | null;
};

export type Threat = {
  score: number;
  label: "Baixo" | "Médio" | "Alto" | "Crítico";
};

export type PlayerLinks = {
  steam: string;
  leetify: string | null;
  faceit: string | null;
  gamersClub: string | null;
};

export type PlayerAnalysis = {
  input: string;
  steamId64: string;
  name: string;
  avatarUrl: string | null;
  country: string | null;
  team: Team;
  levels: PlayerLevels;
  metrics: PlayerMetrics;
  hltv: HltvSummary | null;
  form: number[];
  recentMatches: RecentMatch[];
  mapWinrates: { mapName: string; winrate: number; matches: number }[];
  bans: Ban[];
  links: PlayerLinks;
  sources: SourceState;
  threat: Threat | null;
};

export type LobbyAverage = {
  leetify: number | null;
  aim: number | null;
  adr: number | null;
  winrate: number | null;
};

export type AnalysisResult = {
  id: string;
  createdAt: string;
  mode: string;
  mapName: string | null;
  meSteamId: string;
  players: PlayerAnalysis[];
  lobbyAverage: LobbyAverage;
  partial: boolean;
  warnings: string[];
};

export type HistoryEntry = {
  id: string;
  createdAt: string;
  label: string;
  mapName: string | null;
  meInput: string;
  meSteamId: string;
  players: { input: string; team: Team }[];
};

export type MeProfile = {
  steamId64: string;
  name: string;
  avatarUrl: string | null;
  input: string;
  updatedAt: string;
};
