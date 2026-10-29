import { ResolutionError } from "../errors";
import { accountIdToSteamId64, type ParsedInput } from "../parsers";
import type { SourceStatus } from "../types";

export type SteamProfile = {
  steamId64: string;
  name: string;
  avatarUrl: string | null;
  privacyState: string | null;
};

export type SteamResolution = {
  steamId64: string;
  profile: SteamProfile | null;
  status: SourceStatus;
};

const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function tag(xml: string, name: string): string | null {
  const match = new RegExp(
    `<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`,
  ).exec(xml);
  return match ? decodeXml(match[1].trim()) : null;
}

async function fetchXml(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/xml,text/xml,*/*" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

function parseProfile(xml: string): SteamProfile | null {
  const steamId64 = tag(xml, "steamID64");
  if (!steamId64) return null;
  return {
    steamId64,
    name: tag(xml, "steamID") ?? "Jogador",
    avatarUrl: tag(xml, "avatarFull") ?? tag(xml, "avatarMedium"),
    privacyState: tag(xml, "privacyState"),
  };
}

export async function fetchSteamProfile(steamId64: string): Promise<SteamProfile | null> {
  const xml = await fetchXml(`https://steamcommunity.com/profiles/${steamId64}/?xml=1`);
  return xml ? parseProfile(xml) : null;
}

export async function resolveSteam(parsed: ParsedInput): Promise<SteamResolution> {
  if (parsed.kind === "steamid64") {
    const profile = await fetchSteamProfile(parsed.value);
    return {
      steamId64: parsed.value,
      profile,
      status: profile ? "ok" : "error",
    };
  }

  if (parsed.kind === "steamid3") {
    const steamId64 = accountIdToSteamId64(parsed.value);
    const profile = await fetchSteamProfile(steamId64);
    return {
      steamId64,
      profile,
      status: profile ? "ok" : "error",
    };
  }

  if (parsed.kind === "steam-vanity" || parsed.kind === "nickname") {
    const xml = await fetchXml(
      `https://steamcommunity.com/id/${encodeURIComponent(parsed.value)}/?xml=1`,
    );
    const profile = xml ? parseProfile(xml) : null;
    if (!profile) {
      throw new ResolutionError(
        `Não encontramos o perfil Steam "${parsed.value}". Use o link completo ou o SteamID64.`,
        "not_found",
      );
    }
    return { steamId64: profile.steamId64, profile, status: "ok" };
  }

  throw new ResolutionError(
    "Este tipo de link não aponta para um perfil Steam. Use o link da Steam do jogador.",
    "invalid_input",
  );
}
