import { NextResponse } from "next/server";
import { analyzeLobby, type PlayerRequest } from "@/lib/analysis";
import { ResolutionError, errorMessage } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "gru1";
export const maxDuration = 60;

type Body = {
  meInput?: unknown;
  players?: unknown;
};

function isTeam(value: unknown): value is PlayerRequest["team"] {
  return value === "me" || value === "ally" || value === "enemy";
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const meInput = typeof body.meInput === "string" ? body.meInput.trim() : "";
  if (!meInput) {
    return NextResponse.json(
      { error: "Conecte o seu perfil Steam antes de analisar o lobby." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.players)) {
    return NextResponse.json({ error: "Lista de jogadores inválida." }, { status: 400 });
  }

  const players: PlayerRequest[] = [];
  for (const item of body.players) {
    if (!item || typeof item !== "object") continue;
    const candidate = item as { input?: unknown; team?: unknown };
    if (typeof candidate.input !== "string" || !candidate.input.trim()) continue;
    players.push({
      input: candidate.input.trim(),
      team: isTeam(candidate.team) ? candidate.team : "enemy",
    });
  }

  if (players.length === 0) {
    return NextResponse.json(
      { error: "Adicione pelo menos um jogador para analisar." },
      { status: 400 },
    );
  }

  if (players.length > 9) {
    return NextResponse.json(
      { error: "O lobby aceita no máximo 10 jogadores (incluindo você)." },
      { status: 400 },
    );
  }

  try {
    const result = await analyzeLobby({ meInput, players });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const status = error instanceof ResolutionError && error.code === "invalid_input" ? 400 : 422;
    return NextResponse.json(
      {
        error: errorMessage(error),
        code: error instanceof ResolutionError ? error.code : "error",
      },
      { status },
    );
  }
}
