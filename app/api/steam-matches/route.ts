import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const steamId = request.nextUrl.searchParams.get("steamId")?.trim();
  const authCode = request.nextUrl.searchParams.get("authCode")?.trim();
  const key = process.env.STEAM_API_KEY;
  if (!steamId || !authCode) {
    return NextResponse.json({ error: "steamId e authCode obrigatórios" }, { status: 400 });
  }
  if (!key) return NextResponse.json({ error: "STEAM_API_KEY não configurada" }, { status: 503 });

  const codes: string[] = [];
  let knownCode = "";
  try {
    for (let i = 0; i < 20; i++) {
      const url = `https://api.steampowered.com/ICSGOPlayers_730/GetNextMatchSharingCode/v1/?key=${encodeURIComponent(key)}&steamid=${encodeURIComponent(steamId)}&steamidkey=${encodeURIComponent(authCode)}&knowncode=${encodeURIComponent(knownCode)}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      const next = data?.result?.nextcode;
      if (!next || next === knownCode || next === "n/a") break;
      codes.push(next);
      knownCode = next;
    }
    return NextResponse.json({ count: codes.length, codes });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
