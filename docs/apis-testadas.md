# APIs testadas - evidências e contratos

Testes executados em 29/10/2026, sem chave de API, a partir desta máquina.

## Resumo

| Fonte | Endpoint | Autenticação | Resultado |
|---|---|---|---|
| Leetify (público) | `GET https://api-public.cs-prod.leetify.com/v3/profile?steam64_id=<id>` | opcional | 200 |
| Leetify (público) | `GET https://api-public.cs-prod.leetify.com/v3/profile/matches?steam64_id=<id>` | opcional | 200 |
| Leetify (interno) | `POST https://api.cs-prod.leetify.com/api/games/list-by-ids` | nenhuma | 200 |
| GamersClub (não oficial) | `GET https://api.gamersclub.com.br/v1/user/steam/<id>` | nenhuma | 200 |
| Steam | `GET https://steamcommunity.com/id/<vanity>/?xml=1` | nenhuma | 200 |
| FACEIT | `GET https://open.faceit.com/data/v4/players?...` | Bearer API key | requer chave |

## Leetify - perfil público v3

```bash
curl "https://api-public.cs-prod.leetify.com/v3/profile?steam64_id=76561198034202275"
```

Campos relevantes confirmados:

```json
{
  "steam64_id": "76561198034202275",
  "name": "123",
  "privacy_mode": "public",
  "ranks": {
    "leetify": 3.45,
    "premier": 25482,
    "faceit": 10,
    "faceit_elo": 3555
  },
  "rating": {
    "aim": 97.4412,
    "positioning": 83.8913,
    "utility": 63.7735,
    "clutch": 0.0786,
    "opening": -0.0217
  },
  "bans": [],
  "total_matches": 3631,
  "winrate": 0.5333
}
```

## Leetify - HLTV Rating por partida (endpoint interno)

O perfil público não inclui o HLTV Rating. O endpoint usado pela aplicação web da Leetify inclui.

```bash
curl -X POST "https://api.cs-prod.leetify.com/api/games/list-by-ids" \
  -H "Content-Type: application/json" \
  -d '{
    "gameIds": ["e4519a33-781e-40f2-b668-6631cac4e983"],
    "steam64Id": "76561198034202275"
  }'
```

Resposta (campos relevantes de `playerStats[0]`):

```json
{
  "steam64Id": "76561198034202275",
  "totalKills": 34,
  "totalDeaths": 17,
  "totalAssists": 1,
  "totalDamage": 3444,
  "kdRatio": 2,
  "hsp": 0.7353,
  "hltvRating": 2.03,
  "leetifyRating": 0.1457,
  "ctLeetifyRating": 0.1846,
  "tLeetifyRating": 0.1068,
  "aim": 0.1457,
  "utility": 0.1068,
  "positioning": 0.1846,
  "roundsSurvived": 7,
  "matchResult": "win"
}
```

Lote de 10 partidas: ~1,9 s de resposta.

Observações:

- `hltvRating` é o HLTV Rating calculado pela Leetify, não o rating oficial da HLTV.
- `kast` não veio nesse endpoint (veio `null`); para o card, usar o `hltvRating` pronto, sem recalcular.
- Endpoint não documentado publicamente. Isolar em um adapter e tratar falha como `N/D`.

## GamersClub - endpoint não oficial

```bash
curl "https://api.gamersclub.com.br/v1/user/steam/76561198034202275"
```

```json
{
  "id": 2234577,
  "name": "Oleksandr Kostyliev",
  "nick": "s1mple",
  "level": 19,
  "rating": 2726,
  "steamid": "76561198034202275",
  "country": "br",
  "verified": true,
  "official": true
}
```

Para um SteamID sem conta GamersClub, retorna `404` com `{"error":"NotFound"}`.

## Steam - resolução de vanity URL

```bash
curl "https://steamcommunity.com/id/fallen/?xml=1"
```

Retorna `steamID64`, `steamID`, `avatarMedium`, `avatarFull`, `privacyState` e `visibilityState`. Não exige chave.

## FACEIT

A Data API v4 exige `Authorization: Bearer <api_key>`. A chave é gratuita no Developer Portal e deve ficar no servidor. Sem chave, a resposta é `401`.

Endpoints previstos:

```text
GET /players?game=cs2&game_player_id=<steamid64>
GET /players/{player_id}/stats/cs2
```

## GSI (Game State Integration)

- Oficial e seguro.
- `allplayers` só é populado em espectador/GOTV/replay.
- Durante a partida, o payload traz apenas o jogador local.
- Portanto, não resolve o roster ao vivo no matchmaking oficial.

## Conclusão

- O fluxo manual é a base confiável.
- HLTV Rating é viável via Leetify, com o rótulo correto e fallback.
- GamersClub é um enriquecimento opcional.
- FACEIT depende de uma chave gratuita.
- Nada exige interação com o processo do jogo.
