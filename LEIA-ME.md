# Central de Ferramentas — Base do projeto

## Como abrir

Basta dar duplo-clique em `index.html` — abre direto no navegador, sem
precisar rodar nada. Header e sidebar são gerados por JavaScript puro
(`assets/js/partials.js`), sem fetch, então funciona em `file://` normalmente.

## Arquivos padrão (reaproveitados por todo módulo)

- `assets/css/tokens.css` — cores (tema escuro padrão, vermelho de marca), tipografia
- `assets/css/base.css` — reset + grade do layout
- `assets/css/components.css` — sidebar, header, botões, cards, badges, modal, kanban
- `assets/js/utils.js` — IDs, datas, moeda, iniciais, paleta de cor por cliente
- `assets/js/events.js` — aviso de mudança de dados entre módulos/abas
- `assets/js/db.js` — dados sobre localStorage (clientes, projetos, produtos, oportunidades, tarefas)
- `assets/js/partials.js` — header + sidebar (funções JS, sem fetch)
- `assets/js/app-shell.js` — injeta header/sidebar, aplica tema, ativa navegação

## Módulos prontos

**CRM** (`crm/`)
- `index.html` — cadastro de clientes (nome, contato, etiquetas, observações)
- `produtos.html` — catálogo de produtos (nome, preço, único ou recorrente)
- `funil.html` — Kanban de oportunidades (Lead → Contato → Proposta → Negociação → Ganho/Perdido), vinculando cliente + produto
- `tarefas.html` — Kanban de tarefas/follow-ups do CRM, opcionalmente vinculado a um cliente

**Projetos** (`projetos/`) — *intencionalmente básico por enquanto*
- `index.html` — cadastro de projeto vinculado a um cliente. Sem Kanban ainda.
- `kanban.html` — já existe no código, mas está **pausado**: a gestão completa de
  projetos (Kanban, cronograma etc.) fica para o final, por decisão do usuário.

## Como criar uma página de módulo nova

1. Copie o `<head>` e o final do `<body>` de qualquer página de `crm/`.
2. Ajuste os caminhos (`../assets/...` para páginas uma pasta abaixo da raiz).
3. Defina `const CTF_RAIZ = "../";` (ou `"./"` na raiz).
4. Troque `data-module` para bater com o `data-nav` correspondente em `partials.js`.
5. Mantenha a ordem dos scripts: `utils.js` → `events.js` → `db.js` → `partials.js` → `app-shell.js`.

## Próximo passo

A definir — CRM (clientes, produtos, funil, tarefas) está completo. Projetos
com gestão completa (Kanban) fica para o final.

**Agenda** (`agenda/`)
- `index.html` — calendário mensal (navegação entre meses, botão "Hoje"), eventos com título, data, hora e cliente opcional. Clicar num dia vazio cria evento nessa data; clicar num evento existente edita.

**Financeiro** (`financeiro/`)
- `index.html` — entradas e saídas com status Pago/Pendente (cobre contas a pagar/receber), cards de resumo (entradas, saídas, saldo, pendentes), vinculado a cliente opcional.

**Estoque** (`estoque/`)
- `index.html` — itens físicos (nome, código/SKU, categoria, quantidade, estoque mínimo), badge "Estoque baixo" automático, movimentação de entrada/saída com histórico por item.

**Drive de Arquivos** (`drive/`)
- `index.html` — upload real de arquivos (PDF, Word, Excel, imagens), organizados por cliente/projeto (opcionais), categoria e tags. Baixar e excluir funcionam de verdade.
- **Detalhe técnico importante:** o conteúdo binário dos arquivos NÃO fica no `localStorage` (que só guarda texto e tem poucos MB de limite). Fica no **IndexedDB** (`assets/js/idb-arquivos.js`), outra API do próprio navegador, sem servidor, mas com espaço suficiente para arquivos reais. Só os metadados (nome, cliente, projeto, tags) ficam no `localStorage`, junto com o resto do sistema.

**Tickets** (`tickets/`)
- `index.html` — mini service desk. Lista com prioridade, status, SLA (calculado automaticamente pela prioridade: urgente 4h, alta 8h, média 24h, baixa 48h) e responsável.
- Clicar num ticket abre o detalhe: status editável, comentários, tempo registrado (soma total) e anexos (reaproveita o mesmo armazenamento do Drive/IndexedDB — o anexo também aparece no Drive geral, filtrado pelo cliente do ticket).

**Snippets** (`snippets/`)
- `index.html` — biblioteca de código (HTML, CSS, JavaScript, Python, SQL, Outro), com tags, favoritar (aparece na sidebar) e botão "Copiar código" (usa a Área de Transferência do navegador).

**Base de Conhecimento** (`conhecimento/`)
- `index.html` — artigos, tutoriais, links e anotações, com categoria, tags e link opcional. O conteúdo aceita uma marcação simplificada (`# título`, `## subtítulo`, `- lista`, `**negrito**`, `*itálico*`), renderizada na leitura via `renderizarMarkdownLite` (assets/js/utils.js) — não é markdown completo, só o suficiente para dar uma cara de documento sem precisar de biblioteca externa.

**Prompts** (`prompts/`)
- `index.html` — biblioteca de prompts de IA (IA, ChatGPT, Midjourney, SQL, HTML, CSS, JavaScript, Power BI, Outro), com tags, favoritar e botão "Copiar prompt".
- **Histórico**: toda vez que um prompt é copiado, a data fica registrada (`ultimoUso`) e ele aparece na seção "Usados recentemente" no topo da página, com atalho de cópia rápida.

**Portfólio** (`portfolio/`) — módulo final do roadmap original
- `editar.html` — ferramenta interna (usa a sidebar, como os outros módulos): nome, cargo, bio, tecnologias, links (GitHub/LinkedIn/Blog), experiência profissional, certificados e projetos em destaque (dá pra importar direto da lista de Projetos). Tudo em listas editáveis (+ Adicionar / remover linha).
- `index.html` — a página PÚBLICA de verdade, com layout próprio, **sem a sidebar interna** (pensada para ser compartilhada como link). Lê os dados salvos pelo editor e renderiza timeline, tecnologias, projetos e certificados.

## Roadmap original — status

Todos os módulos da visão inicial estão implementados, exceto a gestão completa de Projetos (Kanban), que ficou pausada por decisão do usuário para ser feita por último.

## Projetos completo (Kanban) — reativado

`projetos/kanban.html` voltou a ficar acessível: clicar num card em
`projetos/index.html` abre o quadro Kanban daquele projeto (colunas fixas: A
Fazer, Em Andamento, Revisão, Concluído). O card na lista de projetos volta a
mostrar a barra de progresso (tarefas concluídas / total).

## Revisão de integração — Categorias, Equipe e vínculos cruzados

**Novo módulo: Categorias** (`categorias/index.html`) — antes, as opções de
categoria/linguagem de Base de Conhecimento, Snippets e Prompts eram fixas no
código. Agora são cadastráveis nesta tela (agrupadas por "Categorias de
Artigos", "Linguagens de Snippets", "Categorias de Prompts"), e os três
módulos leem essas listas dinamicamente. Uma categoria em uso não pode ser
removida.

**Novo módulo: Equipe** (`equipe/index.html`) — cadastro de membros
(nome, cargo, contato), compartilhado entre módulos. Hoje é usado como
"Responsável" em **Projetos** (Kanban/Lista), **Tickets** e **Tarefas do
CRM**, substituindo os campos de texto livre que existiam antes — assim o
mesmo nome não é digitado de formas diferentes em cada lugar.

**Novos vínculos opcionais:**
- **Financeiro**: lançamento agora pode ser ligado a um Projeto, além do
  Cliente (aparece como uma linha extra na descrição da tabela).
- **Agenda**: evento agora pode ser ligado a um Projeto, além do Cliente.

**Projetos — recursos completos (baseado em referência trazida pelo usuário):**
- `projetos/kanban.html`: colunas totalmente customizáveis (criar/remover,
  vale para todos os projetos), tarefas com Responsável (Equipe), tags,
  dependência ("bloqueada por" outra tarefa do mesmo projeto — não deixa
  mover para frente enquanto a bloqueadora não chegar na última coluna),
  checklist (subtarefas) e comentários, tudo dentro do modal com abas
  (Geral / Descrição / Checklist / Comentários).
- `projetos/lista.html`: mesma base de tarefas do Kanban, em formato tabela,
  com busca e filtro por prioridade, prazo atrasado destacado em vermelho.
  Kanban e Lista têm um par de abas para alternar entre as duas visões do
  mesmo projeto.

## Projetos — painel, calendário geral e histórico de ações

Completando a comparação com a referência que o usuário enviou:

- **Painel** (topo de `projetos/index.html`): cards de estatística (projetos
  ativos, tarefas totais, em andamento, concluídas) + carga de trabalho por
  membro da Equipe, em barras de CSS puro (sem Chart.js/CDN).
- **`projetos/calendario.html`**: calendário mensal com os prazos de tarefas
  de TODOS os projetos juntos; clicar num prazo leva direto pro Kanban do
  projeto daquela tarefa.
- **`projetos/historico.html`**: log de ações (criar/editar/excluir projeto
  e tarefa, mover tarefa entre colunas, adicionar/remover coluna), com botão
  de limpar. A função `registrarLog(modulo, acao)` em `db.js` é genérica —
  outros módulos podem chamá-la também no futuro.
- **Equipe**: cada card agora mostra quantas tarefas ativas (fora da última
  coluna do Kanban) aquele membro tem em Projetos.

## Módulo Relatórios — "Power BI" simplificado

Novo módulo, 4 telas, tudo em `relatorios/`:

- **`dados.html`** — explorador do "banco de dados" local: lista as tabelas
  disponíveis (Clientes, Projetos, Tarefas, Financeiro, Estoque, Tickets
  etc.), e ao clicar numa tabela mostra as colunas e uma prévia dos últimos
  50 registros. Campos que são referência a outra tabela (ex: Cliente de um
  Projeto) já aparecem pelo nome, não pelo ID.
- **`metricas.html`** — cadastro de métricas/medidas reutilizáveis: nome +
  tabela + agregação (contagem, soma, média, mínimo, máximo) + campo
  numérico (se aplicável) + filtro opcional (campo/operador/valor). Cada
  card já mostra o resultado calculado na hora.
- **`editor.html?id=X`** — a "área de desenvolvedor": monta um relatório
  bloco por bloco. Tipos de bloco: **Número (KPI)** (usa uma Métrica
  existente), **Barras**, **Rosca** (agrupamento configurado ali mesmo:
  tabela + agrupar por + agregação) e **Tabela** (mostra os dados brutos
  com as colunas escolhidas). Tem alternância Edição/Visualização, e um
  botão **Publicar/Despublicar**.
- **`index.html`** — lista os relatórios (rascunho ou publicado), cria
  novos.

**Detalhe técnico**: os gráficos são feitos sem nenhuma biblioteca externa —
barras reaproveitam o componente `.barra-linha` (já usado no painel de
Projetos), e a rosca usa `conic-gradient` do CSS puro. Toda a lógica de
agregação/agrupamento fica em `assets/js/catalogo-relatorios.js`
(`calcularAgregacao`, `agruparEAgregar`), que também define o **catálogo de
tabelas e campos** disponíveis para relatório — para adicionar uma tabela
nova na lista de Dados/Métricas/Relatórios, é só editar `CATALOGO_TABELAS`
nesse arquivo.

## Melhorias no módulo Relatórios + Perfil + correção de rolagem

**Relatórios ganhou:**
- **Gráfico de Colunas** (vertical), além de Barras (horizontal) que já existia.
- **Tabela com duas modalidades**: "Dados brutos" (como já era) ou **"Agrupada
  com medidas"** — escolhe uma dimensão para agrupar e uma ou mais Métricas
  (da mesma tabela) como colunas, tipo uma tabela dinâmica.
- **Largura por bloco** (completa / metade / um terço) — os blocos agora se
  organizam lado a lado num grid, não só empilhados.
- **Catálogo de tabelas ampliado**: mais colunas em quase todas as tabelas
  (tags, descrição, código, etc.), e 2 tabelas novas — Movimentações de
  Estoque e Agenda (Eventos).
- **Layouts** (`relatorios/layouts.html`): modelos prontos ("Painel
  financeiro", "Visão geral", "Só uma tabela") e você pode criar os seus,
  escolhendo o tipo e a largura de cada bloco. Ao criar um relatório novo, dá
  pra escolher um layout — os blocos entram como "não configurados" e você só
  precisa clicar no lápis de cada um pra apontar os dados.

**Novo módulo: Perfil** (`perfil/index.html`) — nome e cargo, refletidos nos
avatares do header e da sidebar (antes fixos em "VC"). Clicar no avatar leva
direto pro Perfil.

**Correção geral: rolagem dos modais** — antes cada modal tinha sua própria
barra de rolagem interna (`max-height: 90vh; overflow-y: auto` na caixinha).
Agora quem rola é a tela toda por trás (`overflow-y: auto` no fundo escuro),
e a caixinha cresce conforme o conteúdo — sem rolagem "presa" dentro dela.
Isso vale pra **todos os modais do sistema**, é uma mudança só em
`components.css`.

## Layouts — agora com construtor visual (arrastar e soltar)

`relatorios/layouts.html` deixou de ser um modal com dois `<select>` e virou
uma tela cheia com:
- **Paleta de blocos** (Número, Barras, Colunas, Rosca, Tabela) — arraste
  para a área de baixo, ou clique para adicionar ao final.
- **Prévia real de cada bloco**: cada um mostra uma miniatura do que vai virar
  (um "card" com número grande pro KPI, barrinhas pro gráfico de barras,
  colunas pro gráfico vertical, um anel colorido pra rosca, linhas pra
  tabela) — não é só um badge de texto.
- **Arrastar para reordenar** os blocos já colocados.
- **Trocar a largura** (Completa / 1/2 / 1/3) direto na miniatura, sem abrir
  outro modal — o tamanho do preview já reflete a largura escolhida.

## Menu configurável — grupos expansíveis + tela de configuração

A sidebar deixou de ser fixa no código: agora ela lê de `menuGrupos` +
`menuAtribuicoes` (db.js) qual ferramenta aparece em qual grupo, e cada
grupo pode ser **expandido/colapsado clicando no cabeçalho** (o estado fica
salvo por navegador). Se você está numa ferramenta cujo grupo está
colapsado, ele abre sozinho nessa visita (sem mudar sua preferência salva).

Novo item fixo **"Configurar menu"** na sidebar (`menu/index.html`):
- Cria, renomeia (clique e digite) e reordena grupos (setas ◀ ▶).
- Arrasta ferramentas entre os grupos — igual ao construtor de Layouts.
- Uma coluna "Sem grupo" mostra ferramentas que existem mas não aparecem em
  nenhum grupo da sidebar (ficam escondidas até você arrastar pra algum).
- Excluir um grupo não apaga as ferramentas do sistema, só a organização —
  elas voltam pra "Sem grupo".

**Detalhe técnico**: a lista de ferramentas em si (nome, ícone, url) é fixa
em `assets/js/catalogo-menu.js` — o que é configurável é só o agrupamento.
Ao criar um módulo novo, adicione a ferramenta em `CATALOGO_FERRAMENTAS`
nesse arquivo (ver seção 7 da documentação técnica) e ela já aparece
disponível em "Configurar menu" pra você decidir onde ela entra.

## Ferramenta importada: Valor Conta & Ajuste

`valor-ajuste/index.html` — ferramenta que você enviou pronta (gerador de
valor de conta/ajuste a partir de planilha, com busca, favoritos,
calculadora de orçamento e exportação CSV/Excel/PDF). Foi colocada **sem
nenhuma alteração** no código (é uma cópia idêntica do arquivo enviado) —
por isso ela mantém o próprio layout, tema e bibliotecas (SheetJS, jsPDF via
CDN), sem usar o app-shell/sidebar da Central.

Ela já aparece no catálogo (`assets/js/catalogo-menu.js`, chave
`valor-ajuste`), mas **ainda não está em nenhum grupo da sidebar** — abra
"Configurar menu" e arraste "Valor Conta & Ajuste" para o grupo que preferir
(isso não pôde ser feito automaticamente porque os IDs dos seus grupos são
gerados no seu navegador, não existem antes disso).

## Hospedagem: GitHub Pages + Render + Neon (Postgres) — em andamento

O sistema está sendo migrado de "só local" para uma arquitetura em rede:
**front-end estático no GitHub Pages → API própria em Node/Express na
Render → Postgres no Neon**, com login (várias pessoas, cada uma com sua
conta, e-mail/senha). Sem Data API de terceiros, sem provedor de auth
externo — a API é código nosso, testada de ponta a ponta.

**Leia `docs/MIGRACAO-BACKEND.md`** — é o runbook completo (criar o banco
no Neon, publicar a API na Render, publicar o front-end no GitHub Pages) e
a lista exata do que já foi convertido vs. o que falta.

Resumo do que já existe:
- `server/` — a API (Node.js + Express): `db/schema.sql` (29 tabelas),
  `db/migrate.js` + `db/seed.js` (scripts de setup), rotas de autenticação
  (e-mail/senha + JWT) e um roteador genérico de CRUD que atende todas as
  tabelas com o mesmo código (`/api/:tabela`). Testada de verdade contra um
  Postgres local antes de chegar até você — login, CRUD completo,
  proteção por token, bloqueio de tabela não permitida, portfólio público
  sem login, tudo passou. Um bug real foi encontrado e corrigido nesse
  processo (erro de banco durante login derrubava o servidor inteiro).
- `login.html` + `assets/js/auth.js` — cadastro/login/sessão contra a
  nossa própria API.
- `assets/js/config.js` — a única URL que você precisa preencher (a da
  API publicada na Render).
- `assets/js/db.js` — reescrito para chamar a nossa API (agora
  assíncrono).
- `assets/js/app-shell.js` — agora exige login antes de mostrar qualquer
  página, e tem botão de sair.
- **Clientes** (`crm/index.html`) — primeiro módulo 100% convertido, serve
  de modelo para os outros.

Os demais ~18 módulos ainda usam o padrão antigo (síncrono) e precisam ser
convertidos um a um — ver a lista e o "como fazer" em
`docs/MIGRACAO-BACKEND.md`.
