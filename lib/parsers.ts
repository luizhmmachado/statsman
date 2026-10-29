export type ParsedKind =
  | "steamid64"
  | "steamid3"
  | "steam-vanity"
  | "leetify-steam"
  | "leetify-id"
  | "faceit"
  | "gamersclub"
  | "nickname";

export type ParsedInput = {
  kind: ParsedKind;
  value: string;
  raw: string;
};

const STEAMID64 = /^\d{17}$/;
const STEAMID3 = /^\[?U:1:(\d+)\]?$/i;

export function accountIdToSteamId64(accountId: string): string {
  return (76561197960265728n + BigInt(accountId)).toString();
}

function safeUrl(value: string): URL | null {
  try {
    return new URL(value.includes("://") ? value : `https://${value}`);
  } catch {
    return null;
  }
}

function looksLikeUrl(value: string): boolean {
  if (/^https?:\/\//i.test(value)) return true;
  return /^(www\.)?(steamcommunity\.com|leetify\.com|faceit\.com|gamersclub\.com\.br)\//i.test(
    value,
  );
}

export function parsePlayerInput(rawInput: string): ParsedInput | null {
  const raw = rawInput.trim();
  if (!raw) return null;

  if (STEAMID64.test(raw)) {
    return { kind: "steamid64", value: raw, raw };
  }

  const steamId3 = raw.match(STEAMID3);
  if (steamId3) {
    return { kind: "steamid3", value: steamId3[1], raw };
  }

  const url = looksLikeUrl(raw) ? safeUrl(raw) : null;
  if (url) {
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const path = decodeURIComponent(url.pathname).replace(/\/+$/, "");

    if (host === "steamcommunity.com") {
      const profile = path.match(/\/profiles\/(\d{17})/);
      if (profile) return { kind: "steamid64", value: profile[1], raw };

      const vanity = path.match(/\/id\/([^/]+)/);
      if (vanity) return { kind: "steam-vanity", value: vanity[1], raw };
    }

    if (host.endsWith("leetify.com")) {
      const profile = path.match(/\/(?:app\/)?profile\/([^/]+)/);
      if (profile) {
        const value = profile[1];
        return {
          kind: STEAMID64.test(value) ? "leetify-steam" : "leetify-id",
          value,
          raw,
        };
      }
    }

    if (host.endsWith("faceit.com")) {
      const player = path.match(/\/players\/([^/]+)/);
      if (player) return { kind: "faceit", value: player[1], raw };
    }

    if (host.endsWith("gamersclub.com.br")) {
      const player = path.match(/\/(?:player|jogador)\/([^/]+)/);
      if (player) return { kind: "gamersclub", value: player[1], raw };
    }

    return null;
  }

  return { kind: "nickname", value: raw, raw };
}

export function inputLabel(parsed: ParsedInput | null): string {
  if (!parsed) return "Link inválido";
  switch (parsed.kind) {
    case "steamid64":
      return "SteamID64";
    case "steamid3":
      return "SteamID3";
    case "steam-vanity":
      return "Steam";
    case "leetify-steam":
    case "leetify-id":
      return "Leetify";
    case "faceit":
      return "FACEIT";
    case "gamersclub":
      return "GamersClub";
    default:
      return "Nickname";
  }
}
