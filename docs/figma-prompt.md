# Prompt para a IA do Figma - StatsMan

Copie todo o bloco abaixo e cole na ferramenta de IA do Figma (Figma Make ou First Draft). Depois siga o [tutorial de exportação](figma-tutorial.md).

---

```text
Crie o design completo de produto para o "StatsMan", uma aplicação web responsiva instalável (PWA) que analisa adversários e companheiros de Counter-Strike 2 antes da partida, comparando todos com o próprio jogador.

CONTEXTO DO PRODUTO
- Público: jogadores brasileiros de CS2 que usam matchmaking, GamersClub e FACEIT.
- Problema: o jogador entra na partida sem saber o nível e o estilo dos outros 9 jogadores.
- Solução: colar os links dos perfis (Steam, FACEIT, GamersClub ou Leetify) e receber um dashboard comparativo em segundos.
- Não existe detecção automática confiável de todos os jogadores no matchmaking oficial. O fluxo manual é o principal. Um companion local aparece como recurso beta, separado.
- O app não é afiliado à Valve, Leetify, FACEIT ou GamersClub. Isso deve ficar claro no rodapé.

ENTREGÁVEIS
Crie um arquivo com uma página chamada "StatsMan - Product Design" contendo frames nomeados exatamente assim (o nome será usado na exportação via API):
01-landing-desktop
02-onboarding-desktop
03-nova-analise-vazia-desktop
04-nova-analise-preenchida-desktop
05-analise-carregando-desktop
06-resultado-lobby-desktop
07-resultado-confronto-desktop
08-detalhe-jogador-desktop
09-historico-desktop
10-configuracoes-desktop
11-erro-parcial-desktop
12-mobile-analisar
13-mobile-resultado
14-mobile-detalhe
15-mobile-notificacao
16-tablet-resultado

Tamanhos:
- Desktop: 1440 x 1024 (permitir altura maior quando necessário).
- Tablet: 1024 x 1366.
- Mobile: 390 x 844.

DIRETRIZES VISUAIS
- Tema escuro "tático", premium e limpo. Nada de visual gamer infantil, nada de excesso de neon.
- Sensação: painel de esports profissional, denso em informação, mas respirável.
- Use grid de 8 px, cantos de 12 a 16 px, bordas sutis de 1 px.
- Desktop: grid de 12 colunas, margem de 48 px, gutter de 24 px.
- Mobile: margem de 20 px, gutter de 12 px, navegação inferior fixa.
- Tipografia:
  - Títulos: "Space Grotesk", 600/700.
  - Texto: "Inter", 400/500/600.
  - Números e estatísticas: "JetBrains Mono", 500/600, com tabular nums.
- Cores (use variáveis de cor no Figma):
  - Fundo principal: #070A0F
  - Superfície: #0F151D
  - Superfície elevada: #151E28
  - Borda: #22303D
  - Texto principal: #E8EEF4
  - Texto secundário: #8C9BAB
  - Primária (ação): #B7F34A
  - Primária hover: #C7FF63
  - Texto sobre primária: #0A0F07
  - Perigo: #FF5A5F
  - Atenção: #FFB020
  - Sucesso: #42D392
  - Time CT / informação: #4CC9F0
  - Time T / alerta: #F0A35E
  - Rosa Leetify (somente atribuição): #F84982
- Ícones: linha, 20/24 px, consistentes. Não use logotipos oficiais de Leetify, FACEIT, GamersClub ou Valve; use placeholders neutros com o texto da marca. O logo oficial da Leetify será inserido no desenvolvimento.
- Acessibilidade: contraste mínimo AA, foco visível, estados de hover, disabled e seleção. Não use cor como único indicador.

COMPONENTES OBRIGATÓRIOS (crie como componentes com variantes)
- Botão primário, secundário, fantasma e destrutivo (default/hover/focus/disabled/loading).
- Campo de texto, textarea de links, select de plataforma, chip de jogador, chip de time.
- Card de jogador (completo e compacto).
- Badge de nível GamersClub (0-21), badge de nível FACEIT (1-10), badge de fonte de dados.
- Barra de comparação (você versus jogador) com valor absoluto e delta.
- Indicador de ameaça (0-100) com rótulos Baixo/Médio/Alto/Crítico.
- Skeleton de carregamento.
- Toast, banner de erro parcial e tooltip.
- Navegação superior desktop e navegação inferior mobile.
- Modal/drawer de detalhe do jogador.
- Empty state.
- Componente de atribuição "Data Provided by Leetify" com link "Ver no Leetify".

TOM DE VOZ E COPY (pt-BR)
- Direto, técnico e sem exagero. Exemplos:
  - "Analise o lobby antes do primeiro round."
  - "Cole os links dos perfis. A gente compara com o seu."
  - "Dados parciais: a GamersClub não respondeu."
  - "HLTV Rating é a média das últimas 10 partidas, calculada pela Leetify."
  - "HLTV Rating indisponível para este jogador."
  - "Índice de ameaça é uma estimativa, não uma probabilidade de vitória."
- Não use promessas de vitória. Não use "hack", "cheat" ou "trapaça".

TELAS E CONTEÚDO

01-landing-desktop
- Header com logo textual "STATSMAN", links "Como funciona", "Fontes de dados", "Entrar" e botão "Analisar partida".
- Hero em duas colunas:
  - Esquerda: headline "Conheça o lobby antes da primeira bala.", subheadline explicando a comparação com o próprio jogador, botão primário "Analisar partida" e secundário "Ver exemplo".
  - Direita: card de exemplo com 3 jogadores (um "Você", dois adversários), níveis e ratings, e um mini gráfico de barras "Você x Lobby".
- Faixa de fontes: Leetify, FACEIT, GamersClub, Steam (placeholders textuais).
- Seção "Como funciona" em 3 passos: 1) Conecte seu perfil; 2) Cole os links do lobby; 3) Receba a comparação.
- Seção "O que você vê": cards com Leetify Rating, níveis, bans, forma recente.
- Aviso de independência e rodapé com links.

02-onboarding-desktop
- Título "Primeiro, o seu perfil".
- Passo 1 de 2. Campo para link da Steam, com opção de colar SteamID64.
- Preview do perfil encontrado: avatar, nick, Leetify Rating, Premier, nível FACEIT e GamersClub.
- Campos opcionais: apelido FACEIT e link GamersClub.
- Explicação: "Usamos o seu perfil como base de comparação."
- Botão "Continuar" e link "Pular por enquanto".
- Indicador de progresso.

03-nova-analise-vazia-desktop
- Título "Nova análise".
- Duas abas: "Colar links" (ativa) e "Detectar partida (beta)".
- Na aba ativa: textarea grande com placeholder "Cole até 10 links ou IDs. Um por linha.".
- Linha de ajuda com exemplos aceitos: Steam, Leetify, FACEIT, GamersClub, SteamID64.
- Área de times: "Seu time" e "Adversários", cada uma como coluna com slots vazios (5 posições).
- Botão "Analisar lobby" desabilitado até ter pelo menos 2 jogadores.
- Card lateral "Dica": "Você pode adicionar só os adversários. O resto fica como desconhecido.".
- Aba beta: estado bloqueado com explicação curta e botão "Baixar companion".

04-nova-analise-preenchida-desktop
- Mesma estrutura, com 8 chips de jogadores resolvidos.
- Chips com avatar, nick, plataforma detectada e botão de remover.
- Um chip em estado de erro: "Perfil não encontrado" com ação "Corrigir link".
- Um chip em estado de carregando.
- Arrastar e soltar entre os times; mostrar alça de arraste.
- Contador "8 de 10 jogadores".
- Botão "Analisar lobby" ativo.
- Aviso de privacidade: "Não armazenamos estatísticas de terceiros."

05-analise-carregando-desktop
- Título "Analisando o lobby".
- Lista de 10 jogadores com skeleton por linha e status por fonte: Leetify, FACEIT, GamersClub.
- Barra de progresso geral.
- Texto "Isso leva alguns segundos."
- Botão "Cancelar".
- Um exemplo de fonte lenta com ícone de atenção.

06-resultado-lobby-desktop
- Header compacto: mapa (Mirage), modo (Competitivo), horário da análise, botão "Compartilhar" e "Nova análise".
- Resumo no topo: "Você x média do lobby" com 4 métricas: Leetify Rating, Aim, ADR, Winrate.
- Gráfico de barras horizontais comparando você com a média dos adversários.
- Dois blocos lado a lado: "Seu time" e "Adversários", cada um com 5 cards.
- Card de jogador: avatar, nick, badge GC, badge FACEIT, Leetify Rating, HLTV Rating (média Leetify, últimas 10), K/D, ADR, HS%, indicador de ameaça, link "Ver no Leetify".
- Destaque visual para o jogador com maior índice de ameaça.
- Ordenação por ameaça dentro de cada time.
- Rodapé com "Data Provided by Leetify" e aviso de estimativa.
- Exemplos de dados:
  - Você: "L. Machado", GC 14, FACEIT 7 (1.842 ELO), Leetify 1.12, HLTV 1.21, Aim 72, ADR 84.
  - Adversário 1: "v1per", GC 18, FACEIT 9 (2.310 ELO), Leetify 1.38, HLTV 1.34, Aim 81, ADR 96, ameaça Alta.
  - Adversário 2: "duckz", GC 12, FACEIT 6 (1.410 ELO), Leetify 0.94, HLTV 0.92, Aim 61, ADR 71, ameaça Média.
  - Adversário 3: "KRN", GC 21, FACEIT 10 (3.220 ELO), Leetify 1.71, HLTV 1.52, Aim 92, ADR 108, ameaça Crítica.
  - Demais jogadores com dados variados, incluindo um jogador sem HLTV calculado (N/D) e um sem perfil GamersClub.

07-resultado-confronto-desktop
- Título "Você x KRN".
- Comparação lado a lado com avatar grande, níveis e rating.
- Radar ou barras para Aim, Positioning, Utility, Clutch, Opening.
- Tabela de deltas: métrica, você, adversário, diferença.
- "Como jogar contra": 2 ou 3 bullets gerados a partir dos dados (ex.: "Opening forte: evite duelos abertos no início do round.").
- Forma recente: últimos 10 jogos em mini gráfico de linha.
- Bans e histórico.
- Botão "Voltar ao lobby".

08-detalhe-jogador-desktop
- Drawer lateral de 480 px sobre o lobby.
- Cabeçalho com avatar, nick, país, links de plataforma.
- Abas: "Visão geral", "Últimas partidas", "Mapas".
- Visão geral: cards de Leetify Rating, HLTV Rating (média Leetify), Aim, Positioning, Utility, Clutch, Opening, Premier, FACEIT, GamersClub.
- Últimas partidas: lista com mapa, resultado, K/D, ADR, rating.
- Mapas: barras de winrate por mapa.
- Rodapé: "Data Provided by Leetify" e "Ver no Leetify".

09-historico-desktop
- Lista de análises salvas com mapa, modo, data, jogadores analisados e resultado resumido.
- Filtros: todos, com adversário crítico, por mapa.
- Empty state ilustrado.
- Ação "Reabrir análise" e "Excluir".

10-configuracoes-desktop
- Seções: Perfil, Notificações, Companion, Privacidade.
- Perfil: Steam, FACEIT, GamersClub, botão "Atualizar dados".
- Notificações: toggle "Avisar quando a análise ficar pronta", botão "Ativar notificações", estado "Instalar app".
- Companion: status "Não instalado", instruções em 3 passos, botão "Baixar para Windows".
- Privacidade: "Não armazenamos estatísticas de terceiros", botão "Excluir minha conta".

11-erro-parcial-desktop
- Banner no topo: "Análise parcial: 2 fontes não responderam."
- Lista de jogadores com badges de fonte em erro.
- Ação "Tentar novamente" por jogador e "Tentar todas".
- Explicação curta: "Os dados disponíveis já podem ser usados."
- Rodapé mantém atribuição.

12-mobile-analisar
- Header com logo e avatar.
- Título "Nova análise".
- Campo de colagem grande.
- Chips empilhados.
- Seletor de time por jogador ( Você / Aliado / Adversário ).
- Botão fixo no rodapé "Analisar lobby".
- Navegação inferior: Analisar, Histórico, Perfil.

13-mobile-resultado
- Header com mapa e botão voltar.
- Card "Você x média do lobby" com 3 métricas.
- Abas "Adversários" e "Seu time".
- Cards compactos: avatar, nick, níveis, rating, ameaça.
- Toque no card abre detalhe.
- Navegação inferior.

14-mobile-detalhe
- Tela cheia com header, avatar grande, níveis, rating.
- Barras comparativas.
- Lista de últimas partidas.
- Botão "Ver no Leetify".

15-mobile-notificacao
- Mockup de notificação push do sistema:
  - Título: "StatsMan"
  - Texto: "Análise do lobby pronta: 3 adversários com ameaça alta."
  - Ação: "Abrir".
- Fundo com a tela de resultado desfocada.

16-tablet-resultado
- Adaptação do lobby para 1024 px: cards em 2 colunas, resumo no topo, navegação lateral compacta.

ESTADOS QUE PRECISAM EXISTIR
- Carregando (skeleton).
- Erro total (nenhuma fonte respondeu).
- Erro parcial (uma ou mais fontes falharam).
- Perfil privado na Steam.
- Jogador sem perfil GamersClub.
- Jogador sem FACEIT.
- HLTV indisponível (N/D).
- Lista vazia.
- Mais de 10 jogadores (bloqueio com mensagem).
- Link inválido.
- Fonte lenta.

REGRAS DE CONTEÚDO
- Use o HLTV Rating calculado pela Leetify: média das últimas 10 partidas. Mostre "N/D" com tooltip "HLTV Rating indisponível para este jogador" quando não houver dados. Nunca chame de rating oficial da HLTV.
- O Leetify Rating deve aparecer com o nome e a escala originais.
- O índice de ameaça deve ter tooltip: "Estimativa baseada em rating, aim, opening, ADR e forma recente. Não é probabilidade de vitória."
- O rodapé deve conter: "StatsMan não é afiliado à Valve, Leetify, FACEIT ou GamersClub." e "Data Provided by Leetify".
- Todos os textos em português do Brasil.

QUALIDADE DE HANDOFF
- Use Auto Layout em tudo.
- Use variáveis para cores, tipografia e espaçamento.
- Nomeie camadas e componentes em português ou inglês, de forma consistente.
- Crie variantes para os componentes principais.
- Deixe os frames com nomes exatos da lista acima.
- Não use imagens de pessoas reais; use avatares geométricos ou placeholders.
- Entregue também uma versão mobile do resultado e do detalhe.
```

---

## Ajustes depois da primeira geração

Se o Figma cortar conteúdo ou inventar telas, peça correções curtas e específicas, por exemplo:

- "Mantenha os nomes dos frames exatamente como solicitado."
- "Refaça o card de jogador com no máximo 4 métricas visíveis."
- "Adicione o estado de erro parcial no frame 11."
- "Não use logotipos oficiais; use placeholders textuais."
- "Aplique o grid de 8 px e o Auto Layout em todos os cards."
