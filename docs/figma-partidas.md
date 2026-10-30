# Figma Prompt — Tela de Partidas e Detalhe de Partida

Criar protótipos na mesma página Figma dos demais (StatsMan). Estilo dark existente (bg #070a0f, surface #0f1620, primary #b7f34a, fonte display Inter/Space Grotesk, mono JetBrains).

## Tela 1 — /partidas (lista + médias)

Layout: header sticky + container max 1440px. Título "Suas partidas recentes" + subtítulo com nome do jogador e contagem. Abaixo, bloco "Médias do período" com seletor de janela (10 / 30 / 90 partidas) em chips. Grid de 4 cards de métrica: Leetify Rating (média), HLTV Rating (média), K/D (média), e "Variação de elo" (Faceit/Premier/GC conforme disponível, com badge da plataforma). Lista de partidas em cards: mapa (grande), data/hora, resultado (W/L), K/D, rating da partida, botão "Ver detalhes". Paginação ou scroll infinito. Estado vazio: ilustração + CTA "Conectar perfil".

## Tela 2 — /partidas/[id] (detalhe da partida)

Header da partida: mapa, data, placar por time, duração, fonte (MM/FACEIT/GC). Tabela de jogadores (10 linhas) com colunas: Avatar + Nome, Plataforma principal (badge), Nível do modo jogado (Faceit level ou pontos Premier ou nível GC), Leetify Rating da partida, HLTV Rating, K/D/A, ADR, HS%. Destaque para o usuário (linha com fundo primary/5). Ordenação por ameaça/HLTV. Botão "Analisar este lobby" que leva para /analisar com os Steam IDs preenchidos. Card lateral com médias do período selecionado para comparação.

## Interações

- Seletor 10/30/90 atualiza cards de média e destaca período ativo.
- Hover na linha do jogador mostra tooltip com métricas adicionais.
- Botão "Analisar lobby" abre /analisar com inputs preenchidos.

## Notas de dados

- Nível exibido depende do modo: FACEIT → nível Faceit + elo; Premier → pontos; GamersClub → nível GC.
- Médias calculadas sobre as últimas N partidas do usuário conectado.
- Todos os valores podem ser null (exibir "—").
EOF
echo ok