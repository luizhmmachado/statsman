# Tutorial: criar o design no Figma e entregar para análise via API

Este tutorial cobre o caminho completo: gerar o design com a IA do Figma, obter a chave do arquivo, exportar as telas pela API REST e entregar os arquivos para a análise.

Tempo estimado: 15 a 25 minutos.

---

## 1. O que você vai precisar

- Conta no Figma (o plano gratuito serve).
- Node.js 18 ou superior (nesta máquina já existe o Node 22).
- Acesso ao repositório `statsman`.
- O prompt em [figma-prompt.md](figma-prompt.md).

---

## 2. Gerar o design com a IA do Figma

1. Abra o Figma e crie um arquivo novo do tipo **Design**.
2. Dê o nome `StatsMan`.
3. Abra o recurso de IA do Figma:
   - use **First Draft** para gerar telas de design; ou
   - use **Figma Make** se quiser um protótipo navegável. Nesse caso, depois copie as telas para um arquivo de Design.
4. Cole o conteúdo do bloco de código de `docs/figma-prompt.md`.
5. Gere o primeiro rascunho.
6. Confira os pontos abaixo antes de exportar:
   - os frames têm exatamente os nomes `01-landing-desktop`, `02-onboarding-desktop`, ..., `16-tablet-resultado`;
   - existem as versões desktop (1440), mobile (390) e tablet (1024);
   - existem os estados de carregamento, erro parcial e HLTV `N/D`;
   - o rodapé tem o aviso de independência e a atribuição "Data Provided by Leetify".
7. Se algo faltar, peça ajustes curtos, por exemplo: "adicione o frame 11-erro-parcial-desktop com o banner de erro parcial".

Dica: mantenha todos os frames em uma única página chamada `StatsMan - Product Design`. O script exporta todos os frames dessa página.

---

## 3. Obter o File Key do Figma

Com o arquivo aberto, copie a URL da barra de endereço. Ela se parece com:

```text
https://www.figma.com/design/AbC123XyZ456/StatsMan?node-id=12-345
```

O **File Key** é o trecho entre `/design/` e a próxima barra:

```text
AbC123XyZ456
```

Guarde esse valor.

---

## 4. Criar o Personal Access Token

1. Acesse https://www.figma.com/settings (ou Figma → Settings).
2. Vá em **Security**.
3. Em **Personal access tokens**, clique em **Generate new token**.
4. Dê o nome `statsman-export`.
5. Marque os escopos de leitura:
   - **File content** (obrigatório);
   - **Dev resources** (opcional, para metadados de desenvolvimento).
6. Gere e copie o token imediatamente. Ele não será exibido de novo.

O token começa com `figd_`.

Nunca faça commit do token. O `.gitignore` do repositório já ignora `.env`.

---

## 5. Exportar o design pela API

No terminal:

```bash
cd ~/statsman

export FIGMA_TOKEN='figd_SEU_TOKEN_AQUI'
export FIGMA_FILE_KEY='SEU_FILE_KEY_AQUI'

node scripts/figma-export.mjs
```

O script:

1. baixa o JSON do arquivo do Figma;
2. encontra todos os frames;
3. solicita as imagens em PNG com escala 2x;
4. salva tudo em `docs/design/`.

Saída esperada:

```text
docs/design/figma-file.json
docs/design/manifest.json
docs/design/screens/01-landing-desktop.png
docs/design/screens/02-onboarding-desktop.png
...
```

Para exportar apenas frames que começam com um prefixo:

```bash
FIGMA_FRAME_PREFIX='0' node scripts/figma-export.mjs
```

Para mudar a pasta de saída:

```bash
FIGMA_OUT='/tmp/statsman-design' node scripts/figma-export.mjs
```

### Se a API retornar 403

- Confirme que o token tem o escopo **File content: read**.
- Confirme que o token pertence à mesma conta que tem acesso ao arquivo.
- Gere um token novo e tente de novo.

### Se a API retornar 429

- O Figma limita requisições. Aguarde alguns minutos e rode novamente.

### Se algum frame não tiver imagem

- Confirme que o frame está na página `StatsMan - Product Design`.
- Confirme que o frame não está vazio ou oculto.
- Rode o script novamente; links de imagem expiram rápido.

---

## 6. Conferir o resultado

Abra a pasta:

```bash
ls -1 docs/design/screens
```

Verifique se existem os 16 frames. O `manifest.json` lista nome, ID, página, largura e altura de cada frame.

Se preferir exportar manualmente pelo Figma:

1. Selecione os frames.
2. No painel direito, em **Export**, escolha **PNG** e **2x**.
3. Exporte para `docs/design/screens/`.

O JSON bruto do arquivo também é útil para eu ler a estrutura, os componentes e as variáveis de design.

---

## 7. Entregar para a análise

Depois de exportar, me avise com:

```text
Design exportado. File key: <SEU_FILE_KEY>
```

Eu vou ler:

- `docs/design/manifest.json` (lista de telas);
- `docs/design/screens/*.png` (visual);
- `docs/design/figma-file.json` (estrutura, componentes, cores e tipografia).

Com isso, começo o desenvolvimento usando o design como referência e o prompt como especificação funcional.

Se quiser que eu veja o arquivo ao vivo, deixe o link público:

1. No Figma, clique em **Share**.
2. Em **Anyone with the link**, escolha **Can view**.
3. Copie o link e envie.

---

## 8. Opcional: integração via Figma MCP (Dev Mode)

Se você usa o Figma Desktop, é possível expor o contexto de design para agentes via **Dev Mode MCP Server**:

1. Abra o Figma Desktop.
2. Vá em **Figma → Preferences → Enable Dev Mode MCP Server**.
3. O servidor local fica disponível em `http://127.0.0.1:3845/mcp`.
4. Configure esse servidor MCP no opencode, se desejar.

Esse caminho é opcional. A exportação por API REST descrita acima é suficiente e funciona no plano gratuito.

---

## 9. Segurança

- Não comite `FIGMA_TOKEN`.
- Não comite `.env`.
- Se o token vazar, revogue em https://www.figma.com/settings e gere outro.
- O script não envia dados para nenhum servidor além da API oficial do Figma.
