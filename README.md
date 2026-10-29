# StatsMan

Conheça o lobby antes da primeira bala. Análise comparativa de adversários de Counter-Strike 2: nível GamersClub, level/ELO FACEIT, Leetify Rating, HLTV Rating (média calculada pela Leetify), forma, mapas e índice de ameaça.

> **Aviso:** o HLTV Rating exibido é a média das últimas 10 partidas calculada pela Leetify, não o rating oficial da HLTV. O índice de ameaça é uma estimativa comparativa, não uma probabilidade de vitória.

## Status

Fase 1 — aplicação funcional (MVP).

- Landing, onboarding, análise de lobby, resultado, confronto direto, histórico e configurações.
- PWA instalável com service worker, notificações locais e tema dark.
- Dados de exemplo em `/exemplo` para demonstração sem consultas externas.
- FACEIT oficial é opcional via `FACEIT_API_KEY`; sem a chave, o level/ELO vem da Leetify.

Documentação de descoberta e design:

- [Análise de requisitos e viabilidade](docs/analise-requisitos.md)
- [APIs testadas e contratos](docs/apis-testadas.md)
- [Prompt para a IA do Figma](docs/figma-prompt.md)
- [Tutorial: exportar o design via API do Figma](docs/figma-tutorial.md)

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 3
- lucide-react
- APIs públicas de Steam, Leetify, GamersClub e FACEIT (opcional)
- Sem banco de dados no MVP: perfil e histórico ficam no navegador (`localStorage`), último resultado em `sessionStorage`

## Rodando localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

### Variáveis de ambiente

| Variável | Obrigatória | Uso |
|---|---|---|
| `FACEIT_API_KEY` | Não | Habilita level/ELO e stats lifetime oficiais da FACEIT |
| `NEXT_PUBLIC_SITE_URL` | Não | Base para sitemap e links absolutos |
| `STEAM_API_KEY` | Não | Reservado; a resolução atual usa o XML público da Steam |
| `LEETIFY_API_KEY` | Não | Reservado para limites maiores na API pública |

A chave da FACEIT fica **somente no servidor** (route handlers) e nunca é enviada ao cliente.

## Scripts

```bash
npm run dev        # desenvolvimento
npm run build      # build de produção
npm run start      # servidor de produção
npm run typecheck  # TypeScript sem emitir
```

## Como funciona

1. O usuário conecta o próprio perfil (Steam, Leetify, GamersClub, FACEIT ou nickname).
2. Cola até 9 jogadores, separando aliados e adversários.
3. O servidor resolve cada entrada para um SteamID64, consulta as fontes em paralelo e normaliza os dados.
4. O cliente calcula o índice de ameaça comparando cada adversário com o perfil de referência.
5. O resultado fica disponível na sessão e o histórico local guarda apenas links e metadados.

### Endpoints

- `POST /api/analysis` — `{ meInput, players: [{ input, team }] }`
- `GET /api/player?input=...&hltv=1` — resolve um único perfil
- `GET /api/health` — healthcheck

### Fluxo de dados

```text
entrada -> parser -> SteamID64 -> Steam + Leetify + GamersClub + FACEIT
        -> normalização -> cálculo de ameaça -> resultado
```

## Privacidade e limites

- Não solicitamos senha da Steam e não acessamos a conta do usuário.
- Não persistimos payloads de terceiros. O histórico local contém apenas links e metadados.
- Nada de injeção no jogo, overlay com hooks, leitura de memória ou automação.
- A API interna da Leetify usada para o HLTV Rating não é documentada e pode mudar; falhas retornam `N/D` e não quebram a análise.
- A integração com a GamersClub é não oficial e pode ficar indisponível.

## Estrutura

```text
app/                 rotas e páginas (App Router)
app/api/             route handlers
components/          UI (cards, drawer, resultado, PWA)
lib/                 parsers, formatadores, ameaça, storage, providers
public/              manifest, service worker e ícones
docs/                requisitos, APIs testadas e guias de Figma
```

## Atribuição

Data Provided by [Leetify](https://leetify.com/). StatsMan não é afiliado à Valve, Leetify, FACEIT ou GamersClub.

## Autor

Luiz Henrique Maiolini Machado (`luizhmmachado`)
