// Decodifica share codes de partidas de CS:GO (formato CSGO-XXXXX-...)
// Baseado no algoritmo público de decodificação de share codes.
export type MatchShareCode = {
  matchId: bigint;
  outcomeId: number;
  token: number;
};

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function decodeShareCode(code: string): MatchShareCode | null {
  const cleaned = code.replace(/^CSGO-/i, "").replace(/-/g, "").toUpperCase();
  if (!cleaned || cleaned.length < 20) return null;
  let bits = 0n;
  let bitCount = 0;
  const out: number[] = [];
  for (const char of cleaned) {
    const idx = ALPHABET.indexOf(char);
    if (idx < 0) return null;
    bits = (bits << 5n) | BigInt(idx);
    bitCount += 5;
    if (bitCount >= 8) {
      bitCount -= 8;
      out.push(Number((bits >> BigInt(bitCount)) & 0xffn));
    }
  }
  // last 8 bytes contain match id (4) + outcome (2) + token (2) little-endian
  if (out.length < 16) return null;
  const tail = out.slice(-8);
  const matchId = BigInt(
    tail[0] | (tail[1] << 8) | (tail[2] << 16) | (tail[3] << 24),
  );
  const outcomeId = tail[4] | (tail[5] << 8);
  const token = tail[6] | (tail[7] << 8);
  return { matchId, outcomeId, token };
}
