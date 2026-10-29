# StatsMan

Análise de adversários de Counter-Strike 2 antes da partida: nível GamersClub, nível FACEIT, Leetify Rating, rating HLTV (quando existir) e comparação direta com o seu próprio perfil.

## Status

Fase 0 - requisitos, viabilidade e design.

- [Análise de requisitos e viabilidade](docs/analise-requisitos.md)
- [Prompt para a IA do Figma](docs/figma-prompt.md)
- [Tutorial: exportar o design via API do Figma](docs/figma-tutorial.md)

## Decisão de produto (resumo)

- Aplicação web responsiva instalável (PWA), publicada em domínio gratuito (`*.vercel.app`).
- Banco e autenticação no Supabase (plano gratuito).
- Detecção automática de todos os jogadores da partida não é confiável no matchmaking oficial; o fluxo principal será colar os links dos perfis.
- Um companion local (Game State Integration, recurso oficial da Valve) pode detectar o início da partida e automatizar a análise pós-partida em uma fase posterior.
- Sem injeção no jogo, sem overlay com hooks, sem leitura de memória: nada que exponha a conta a risco de anti-cheat.

## Desenvolvimento

O código da aplicação será criado após a validação do design no Figma.

## Autor

Luiz Henrique Maiolini Machado (`luizhmmachado`)
