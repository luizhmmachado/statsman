# StatsMan - Análise de Requisitos e Viabilidade

Data da análise: 29/10/2026
Autor: Luiz Henrique Maiolini Machado (`luizhmmachado`)

---

## 1. Resumo executivo

O StatsMan é uma aplicação para analisar, antes ou no início de uma partida de Counter-Strike 2, o perfil dos companheiros e adversários, comparando todos com o próprio jogador.

A recomendação é construir uma **aplicação web responsiva instalável (PWA)**, e não um aplicativo mobile nativo neste primeiro momento. O motivo é técnico: não existe fonte oficial que entregue, de forma confiável, os SteamIDs dos 10 jogadores no momento em que a partida é criada no matchmaking oficial. O Game State Integration (GSI) da Valve é seguro e oficial, mas só expõe `allplayers` quando o cliente está espectando/GOTV, não enquanto o jogador está jogando. Portanto:

- **Fluxo principal:** o usuário cola os links dos perfis (Steam, FACEIT, GamersClub ou Leetify) e recebe a análise.
- **Fluxo secundário (beta):** um companion local detecta a partida via GSI, identifica o jogador e automatiza a análise **depois** que a partida termina, usando o histórico de partidas.
- **Aplicativo mobile:** a PWA cobre instalação na tela inicial e notificações push. Um app nativo só se justifica se a detecção automática em tempo real for validada em uma fase futura.

Nada no desenho proposto injeta código no jogo, lê memória, cria overlay com hooks ou automatiza ações. O risco de anti-cheat é, portanto, baixo.

---

## 2. Escopo funcional

### 2.1 Dentro do escopo (MVP)

1. Cadastro/login simples (Supabase Auth).
2. Perfil do jogador dono da conta: SteamID64, apelido FACEIT opcional, ID GamersClub opcional.
3. Nova análise com até 10 jogadores (usuário + 9), separados em dois times.
4. Entrada por link ou ID:
   - `steamcommunity.com/id/<vanity>` e `steamcommunity.com/profiles/<steamid64>`;
   - SteamID64 puro;
   - `leetify.com/app/profile/<id>`;
   - `faceit.com/pt-br/players/<nick>`;
   - `gamersclub.com.br/player/<id>`;
   - apelido puro (com seleção de plataforma quando ambíguo).
5. Resolução automática do SteamID64 a partir de vanity URL.
6. Agregação por jogador:
   - nível e rating GamersClub;
   - nível e ELO FACEIT;
   - Leetify Rating, Aim, Positioning, Utility, Clutch e Opening;
   - Premier/Competitive quando disponível;
   - banimentos de plataforma;
   - partidas recentes e forma atual;
   - rating HLTV quando existir (ver seção 5.4).
7. Dashboard comparativo:
   - você versus média do lobby;
   - você versus cada adversário;
   - cards por jogador, separados por time;
   - ranking de ameaças;
   - links "Ver no Leetify" e atribuição "Data Provided by Leetify".
8. Histórico de análises (somente metadados e SteamIDs, nunca o payload de terceiros).
9. Estados de carregamento, erro parcial e fonte indisponível.
10. PWA instalável e notificação push quando uma análise assíncrona ficar pronta.

### 2.2 Fora do escopo do MVP

- Detecção automática dos 10 jogadores em partida ao vivo no matchmaking oficial.
- Overlay dentro do jogo.
- Aplicativo nativo iOS/Android.
- Rating HLTV para jogadores de matchmaking comum (a HLTV não publica esse dado).
- Scraping autenticado de GamersClub/FACEIT.
- Automação de fila, aceite de partida ou qualquer ação dentro do jogo.

### 2.3 Requisitos não funcionais

- Análise completa em até 10 segundos para 10 jogadores em condições normais.
- Tolerância a falha de uma fonte: a análise continua com os dados disponíveis.
- Nenhum dado de terceiros persistido no banco.
- Chaves de API somente no servidor.
- Interface em português do Brasil.
- Acessibilidade AA: contraste, foco visível, navegação por teclado, textos alternativos.
- Responsivo de 360 px a 1440 px.

---

## 3. Viabilidade requisito a requisito

| Requisito | Viabilidade | Como será atendido |
|---|---|---|
| Nível GamersClub | Alta, com ressalva | Endpoint público não documentado da GamersClub (testado com sucesso). Não é API oficial; pode mudar. Fallback: link manual. |
| Nível FACEIT | Alta | FACEIT Data API v4 com chave gratuita de servidor. Fallback: Leetify retorna `ranks.faceit` e `faceit_elo` para contas vinculadas. |
| Leetify Rating | Alta | Leetify Public CS API v3. Funciona sem chave, com limite de requisições; chave gratuita disponível. |
| HLTV Rating | Baixa para o público geral | A HLTV calcula rating apenas em partidas que ela cobre (cenário profissional). Para matchmaking comum não existe. Exibir "N/D" com explicação e usar Leetify Rating como métrica principal. |
| Buscar automaticamente ao entrar na partida | Baixa no matchmaking oficial | GSI não entrega os outros jogadores enquanto se joga. Ver seção 4. |
| Pedir links dos perfis | Alta | Fluxo principal do MVP. |
| Comparar sempre com o próprio jogador | Alta | O perfil do usuário é o baseline de todas as comparações. |
| Notificar quando a análise ficar pronta | Alta | Web Push na PWA (VAPID). |
| API própria ou subsidiada pela Valve | Média para pós-partida | Histórico oficial por share code + token via Game Coordinator, somente depois da partida. Não há API oficial de roster ao vivo. |

---

## 4. Detecção automática da partida: o ponto crítico

### 4.1 O que o GSI entrega

O Game State Integration é um recurso **oficial da Valve**: o CS2 envia HTTP POST para um endereço local configurado em `gamestate_integration_*.cfg`.

O payload contém:

- `provider`, `map`, `round`, `player`, `phase_countdowns`;
- `allplayers`, com todos os jogadores e seus SteamIDs.

Porém, a documentação e as bibliotecas de GSI são explícitas: **`allplayers` só é populado quando o cliente está espectando, em replay ou GOTV**. Durante uma partida normal, o payload traz apenas o jogador local. Logo, o GSI sozinho não resolve "quem são os adversários" no momento em que a partida começa.

Referências:

- https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration
- https://docs.rs/cs2-gsi/latest/cs2_gsi/model/struct.GameState.html

### 4.2 O que existe de alternativa

| Caminho | Entrega roster ao vivo? | Risco | Veredito |
|---|---|---|---|
| GSI local | Não (só o jogador local) | Nenhum (oficial) | Usar para detectar início/fim e automatizar o pós-partida |
| FACEIT Data API | Sim, se houver `match_id` e a partida for FACEIT | Baixo (API oficial) | Fase 2: importar por link da sala |
| GamersClub | Sim, via endpoints internos autenticados | Médio (não oficial, sessão, CAPTCHA) | Fase 3, somente com fallback manual |
| Game Coordinator / SteamKit | Dados da partida, normalmente após o fim | Médio/alto (conta bot, ToS) | Evitar no MVP; somente pós-partida via share code oficial |
| Overlay/leitura de memória | Sim, mas fora das regras | Alto (anti-cheat) | Proibido |
| Scraping da HLTV | Não para matchmaking | Médio (bloqueios) | Não usar |

### 4.3 Conclusão

O requisito "buscar automaticamente ao entrar na partida" **não é atendido de ponta a ponta** no matchmaking oficial com fontes oficiais. A aplicação será construída para:

1. funcionar muito bem no modo manual (colar links), que é o caso de uso garantido;
2. detectar automaticamente o início da partida via companion GSI e avisar o usuário;
3. automatizar a análise pós-partida (quando o roster já é conhecido pelo histórico);
4. importar roster automaticamente em plataformas que exponham a partida por ID (FACEIT primeiro).

Essa decisão também responde à condição do requisito: como a automação completa não é possível, o app mobile nativo não é obrigatório agora. A PWA entrega instalação e notificações sem o custo de duas lojas.

---

## 5. Análise das APIs

### 5.1 Leetify Public CS API v3

- Base: `https://api-public.cs-prod.leetify.com`
- Documentação: https://api-public-docs.cs-prod.leetify.com/
- Chave: opcional para uso básico; gratuita em https://leetify.com/app/developer para limites maiores.
- Endpoints relevantes:
  - `GET /v3/profile?steam64_id=<id>` ou `?id=<leetify_id>`;
  - `GET /v3/profile/matches?steam64_id=<id>`;
  - `GET /v2/matches/{gameId}`.
- Dados confirmados em teste local (29/10/2026, sem chave):
  - `ranks.leetify`, `ranks.premier`, `ranks.faceit`, `ranks.faceit_elo`, `ranks.wingman`;
  - `rating.aim`, `rating.positioning`, `rating.utility`, `rating.clutch`, `rating.opening`, `rating.ct_leetify`, `rating.t_leetify`;
  - `stats` (preaim, reaction time, accuracy, flash, trade, etc.);
  - `bans`, `recent_matches`, `recent_teammates`, `total_matches`, `winrate`, `privacy_mode`.
- Regras obrigatórias (Developer Guidelines):
  - exibir o logo "Data Provided by Leetify" linkando para https://leetify.com/;
  - links "View on Leetify" nos dados exibidos;
  - não armazenar dados da API;
  - não renomear, reescalonar ou recalcular métricas da Leetify;
  - não sugerir afiliação ou endosso;
  - não usar o nome/logo Leetify como marca do aplicativo.
- Fonte: https://leetify.com/blog/leetify-api-developer-guidelines/

### 5.2 FACEIT Data API v4

- Base: `https://open.faceit.com/data/v4`
- Chave: obrigatória, gratuita no Developer Portal (server-side key).
- Endpoints relevantes:
  - `GET /players?game=cs2&game_player_id=<steamid64>`;
  - `GET /players/{player_id}/games/cs2/stats`;
  - `GET /players/{player_id}/stats/cs2`.
- Retorna `nickname`, `avatar`, `country`, `skill_level` (nível 1-10), `faceit_elo` e estatísticas.
- A chave fica apenas no servidor.
- Fonte: https://docs.faceit.com/docs/data-api/

### 5.3 GamersClub

- Não existe API pública oficial documentada.
- Endpoint não documentado usado pelo ecossistema (e validado em teste local):
  - `GET https://api.gamersclub.com.br/v1/user/steam/<steamid64>`
  - Retorno: `id`, `name`, `nick`, `level`, `rating`, `avatar`, `steamid`, `country`, `verified`, `official`.
- Riscos: mudança sem aviso, bloqueio por Cloudflare, limite de requisições, ausência de SLA.
- Estratégia:
  - usar como enriquecimento opcional;
  - timeout curto e cache em memória;
  - fallback para o link manual do perfil;
  - nunca exigir sessão/cookie do usuário no MVP.
- Fonte adicional: https://cs-api.gamersclub.com.br/ e https://api.gamersclub.com.br/

### 5.4 HLTV

- A HLTV não oferece API pública.
- O "HLTV Rating" é calculado em partidas do cenário competitivo cobertas pela HLTV. Jogadores de matchmaking comum não possuem esse valor.
- Decisão:
  - exibir `N/D` com tooltip explicando;
  - quando o jogador for profissional e o dado existir em fonte licenciada, exibir com a fonte;
  - não rotular o Leetify Rating como HLTV Rating;
  - não criar um "HLTV Rating caseiro" sem deixar claro que é estimativa. Se for criado no futuro, o rótulo será "Índice de impacto (estimado)" e não "HLTV Rating".

### 5.5 Steam e Valve

- Resolver vanity URL sem chave: `https://steamcommunity.com/id/<vanity>/?xml=1` retorna `steamID64` (testado).
- Perfil/avatar: mesmo XML ou Steam Web API (`ISteamUser/GetPlayerSummaries`) com chave gratuita.
- Histórico oficial de partidas: share code + token via Game Coordinator (bibliotecas como `node-globaloffensive`, método `requestGame`). É **pós-partida**, não roster ao vivo.
- Fonte: https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Access_Match_History

### 5.6 Resumo de chaves necessárias

| Serviço | Chave | Obrigatória no MVP |
|---|---|---|
| Leetify | opcional (recomendada) | Não |
| FACEIT | sim | Sim, para nível FACEIT completo |
| Steam Web API | opcional | Não (XML resolve vanity) |
| GamersClub | não | Não |
| Supabase | sim | Sim |
| Web Push (VAPID) | gerada pelo app | Sim, para notificações |

---

## 6. Anti-cheat e conformidade

### 6.1 Permitido e seguro

- Aplicação web/PWA executando no navegador.
- Companion local que apenas **recebe** POSTs HTTP do GSI oficial.
- Leitura de arquivos de configuração do próprio CS2 para instalar o `.cfg` do GSI.
- Consumo de APIs públicas ou com chave fornecida pelo usuário.

### 6.2 Proibido no projeto

- Injeção de DLL, hook de teclado/mouse, overlay que interage com o jogo.
- Leitura/escrita de memória do processo `cs2.exe`.
- Automação de fila, aceite, compra ou movimento.
- Contas bot para acessar Game Coordinator em nome de usuários.
- Scraping atrás de autenticação ou contorno de CAPTCHA.

### 6.3 Observação sobre o companion

O companion é um processo separado, sem privilégios sobre o jogo. Ele escuta `127.0.0.1`, valida um token e encaminha eventos para a API. O `.cfg` do GSI é instalado pelo próprio usuário, com instruções claras. Nada disso é considerado cheat pela Valve.

---

## 7. Arquitetura proposta

### 7.1 Stack

- **Frontend/Backend:** Next.js 15 (App Router) + TypeScript.
- **Estilo:** Tailwind CSS v4 + componentes próprios.
- **Banco/Auth:** Supabase (Postgres, Auth por magic link, RLS).
- **Deploy:** Vercel (plano gratuito, domínio `statsman.vercel.app`).
- **PWA:** manifest + service worker + Web Push (VAPID).
- **Companion (fase 3):** Node.js/TypeScript, escuta GSI em `127.0.0.1:32145`.
- **Testes:** Vitest (parsers e agregação) e Playwright (fluxo principal).

### 7.2 Camadas

```text
Browser/PWA
   |
   v
Next.js Route Handlers (BFF)  -- chaves e rate limit no servidor
   |
   +--> Leetify Public API
   +--> FACEIT Data API
   +--> GamersClub (não oficial)
   +--> Steam Community XML
   |
   v
Supabase (perfis, metadados de análise, inscrições de push)
```

### 7.3 Endpoints internos

| Método | Rota | Função |
|---|---|---|
| POST | `/api/resolve` | Resolve link/ID em SteamID64 + plataformas |
| POST | `/api/analysis` | Agrega dados dos jogadores e monta a comparação |
| GET | `/api/analysis/:id` | Reabre uma análise (refaz a busca, não usa cache persistido) |
| POST | `/api/push/subscribe` | Registra inscrição Web Push |
| POST | `/api/companion/event` | Recebe evento do companion GSI |
| GET | `/api/health` | Saúde e versão |

### 7.4 Estratégia de resiliência

- `Promise.allSettled` por jogador e por fonte.
- Timeout de 6 s por fonte.
- Cache em memória de 5 min por SteamID (não persistido).
- Deduplicação de requisições concorrentes do mesmo jogador.
- Rate limit por IP e por usuário.
- Resposta normalizada com `sources: { leetify: "ok" | "error" | "not_found", ... }`.
- A UI mostra "parcial" quando alguma fonte falha, sem bloquear o resultado.

### 7.5 Modelo normalizado do jogador

```ts
type PlayerAnalysis = {
  steamId64: string;
  name: string;
  avatarUrl: string | null;
  team: "me" | "ally" | "enemy";
  leetify: {
    rating: number | null;
    aim: number | null;
    positioning: number | null;
    utility: number | null;
    clutch: number | null;
    opening: number | null;
    premier: number | null;
    recentMatches: RecentMatch[];
    bans: Ban[];
    privacyMode: string;
  } | null;
  faceit: {
    nickname: string | null;
    level: number | null;
    elo: number | null;
  } | null;
  gamersClub: {
    nickname: string | null;
    level: number | null;
    rating: number | null;
  } | null;
  hltv: {
    rating: number | null;
    source: string | null;
  } | null;
  sources: Record<string, "ok" | "error" | "not_found">;
};
```

### 7.6 Comparação com o próprio jogador

- Baseline: perfil do usuário.
- Para cada métrica, calcular diferença absoluta e percentual.
- "Índice de ameaça" de 0 a 100, com fórmula pública e transparente:
  - 40% Leetify Rating relativo;
  - 20% Aim;
  - 15% Opening;
  - 15% ADR/impacto;
  - 10% forma recente.
- O índice é uma heurística de priorização, não uma probabilidade de vitória.
- Se o usuário não tiver perfil completo, a UI pede para completar antes de comparar.

### 7.7 Modelo de dados (Supabase)

```sql
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  steam_id64 text not null,
  faceit_nickname text,
  gamersclub_id text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  map_name text,
  mode text,
  roster jsonb not null, -- apenas steamids + time, sem estatísticas
  created_at timestamptz not null default now()
);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create table companion_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);
```

Regras:

- RLS habilitado em todas as tabelas.
- Nenhuma tabela guarda payload da Leetify/FACEIT/GamersClub.
- `roster` guarda somente SteamID64 e time.
- Exclusão de conta remove tudo em cascata.

### 7.8 Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LEETIFY_API_KEY=
FACEIT_API_KEY=
STEAM_API_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
COMPANION_SHARED_SECRET=
```

---

## 8. Privacidade e conformidade

- **Leetify:** não armazenar; exibir atribuição; links de retorno; não renomear métricas; não recalcular.
- **FACEIT:** usar chave server-side; respeitar termos e limites.
- **GamersClub:** endpoint não oficial, uso moderado, fallback manual, aviso de que o dado pode estar indisponível.
- **LGPD:** coletar o mínimo; permitir exclusão; não compartilhar dados entre usuários; não usar dados para treinar modelos.
- **Transparência:** a UI informa a fonte e o horário de cada métrica.

---

## 9. Design e experiência

- Tema escuro "tático", foco em leitura rápida durante o aquecimento da partida.
- Duas visões: "Lobby" (todos os jogadores) e "Confronto" (você versus um adversário).
- Cards com avatar, apelido, níveis, rating e um indicador de ameaça.
- Sem poluição visual: no máximo 4 métricas por card; o restante no detalhe.
- Mobile: cards compactos, navegação inferior, comparação por swipe.
- O prompt completo para a IA do Figma está em [figma-prompt.md](figma-prompt.md).
- O tutorial de exportação via API está em [figma-tutorial.md](figma-tutorial.md).

---

## 10. Roadmap

### Fase 0 - Descoberta e design (atual)

- Análise de requisitos e viabilidade.
- Repositório e documentação.
- Prompt + design no Figma.

### Fase 1 - MVP manual

- Next.js + Supabase + PWA.
- Resolução de links e agregação.
- Dashboard comparativo.
- Histórico e estados de erro.

### Fase 2 - Conta e notificações

- Login, perfil baseline, histórico por usuário.
- Web Push e análise assíncrona.
- Compartilhamento de análise por link.

### Fase 3 - Automação parcial

- Importação por link de sala da FACEIT.
- Companion GSI: detectar início/fim, notificar e analisar o pós-partida.
- Suporte a GamersClub por link de partida, se viável.

### Fase 4 - Avaliação de app nativo

- Só fazer se a automação em tempo real se provar confiável.
- Caso contrário, manter PWA.

---

## 11. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| API da Leetify mudar ou limitar | Alto | Camada de adaptação, chave gratuita, cache curto, fallback visual |
| Endpoint da GamersClub bloquear | Médio | Fonte opcional, timeout, fallback manual |
| FACEIT negar chave ou limitar | Médio | Degradar para dados da Leetify |
| HLTV não ter rating | Alto para o requisito | Comunicar `N/D`; usar Leetify Rating |
| Detecção automática não funcionar | Alto | Fluxo manual é o principal; companion é beta |
| Anti-cheat | Alto | Nenhuma interação com o processo do jogo |
| Vazamento de chaves | Alto | Somente server-side; `.env` fora do git |
| Design do Figma não cobrir estados | Médio | Prompt exige estados de loading/erro/parcial |

---

## 12. Critérios de aceite do MVP

1. Dado um conjunto de até 10 links válidos, a análise é exibida em até 10 s.
2. Vanity URL da Steam é resolvida sem chave.
3. Nível GamersClub, nível FACEIT e Leetify Rating aparecem quando disponíveis.
4. Quando uma fonte falha, o restante continua e a UI indica a falha.
5. A comparação usa o perfil do usuário como baseline.
6. Nenhum payload de terceiros é gravado no banco.
7. Atribuição "Data Provided by Leetify" e links "Ver no Leetify" presentes.
8. Layout funcional em 360 px, 768 px e 1440 px.
9. PWA instalável e notificação de teste funcional.
10. Nenhum código de interação com o processo do jogo.

---

## 13. Referências

- Leetify Developer Guidelines: https://leetify.com/blog/leetify-api-developer-guidelines/
- Leetify Public API: https://api-public-docs.cs-prod.leetify.com/
- Leetify API key: https://leetify.com/app/developer
- FACEIT Data API: https://docs.faceit.com/docs/data-api/
- FACEIT API keys: https://docs.faceit.com/getting-started/authentication/api-keys/
- Valve GSI: https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration
- Valve Match History: https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Access_Match_History
- GamersClub CS API: https://cs-api.gamersclub.com.br/
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- Web Push: https://developer.mozilla.org/docs/Web/API/Push_API

---

## 14. Decisões pendentes

1. Visibilidade do repositório: criado como **privado**; pode ser tornado público depois.
2. Login: magic link por e-mail no MVP; Steam OpenID pode entrar na fase 2.
3. Domínio final: `statsman.vercel.app` no MVP.
4. Chave FACEIT: necessária para o nível FACEIT completo; pode ser criada gratuitamente pelo desenvolvedor.
