import { NextRequest, NextResponse } from "next/server";
import { decodeShareCode } from "@/lib/sharecode";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim();
  if (!code) {
    return NextResponse.json({ error: "code obrigatório" }, { status: 400 });
  }
  const decoded = decodeShareCode(code);
  if (!decoded) {
    return NextResponse.json({ error: "Share code inválido" }, { status: 400 });
  }
  return NextResponse.json({
    matchId: decoded.matchId.toString(),
    outcomeId: decoded.outcomeId,
    token: decoded.token,
    note: "Decodificado localmente. Para listar jogadores, configure STEAM_API_KEY e use o auth code da conta.",
  });
}
