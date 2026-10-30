import { NextResponse } from "next/server";
import { resolvePlayer } from "@/lib/analysis";
import { ResolutionError, errorMessage } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "gru1";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const input = url.searchParams.get("input")?.trim();
  const includeHltv = url.searchParams.get("hltv") === "1";

  if (!input) {
    return NextResponse.json({ error: "Informe o link ou ID do jogador." }, { status: 400 });
  }

  try {
    const player = await resolvePlayer(
      { input, team: "me" },
      { includeHltv },
    );
    return NextResponse.json({ player });
  } catch (error) {
    const status =
      error instanceof ResolutionError &&
      (error.code === "invalid_input" || error.code === "missing_key")
        ? 400
        : 404;
    return NextResponse.json(
      { error: errorMessage(error), code: error instanceof ResolutionError ? error.code : "error" },
      { status },
    );
  }
}
