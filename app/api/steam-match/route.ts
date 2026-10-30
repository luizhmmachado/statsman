import { NextRequest, NextResponse } from "next/server";
import { decodeShareCode } from "@/lib/sharecode";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim();
  const key = process.env.STEAM_API_KEY;
  if (!code) return NextResponse.json({ error: "code obrigatório" }, { status: 400 });
  if (!key) return NextResponse.json({ error: "STEAM_API_KEY não configurada" }, { status: 503 });
  const decoded = decodeShareCode(code);
  if (!decoded) return NextResponse.json({ error: "share code inválido" }, { status: 400 });
  try {
    const url = `https://api.steampowered.com/ICSGOServers_730/GetMatchStats/v1/?key=${encodeURIComponent(key)}&matchid=${decoded.matchId}&outcomeid=${decoded.outcomeId}&token=${decoded.token}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json({ decoded, data });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
