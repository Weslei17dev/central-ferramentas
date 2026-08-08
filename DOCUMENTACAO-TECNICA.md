# Central de Ferramentas — Documentação Técnica

> Este documento existe para que **qualquer pessoa ou IA** que nunca tenha
> visto este projeto consiga entender como ele funciona, rodá-lo, e
> continuar o desenvolvimento sem quebrar o que já existe. Leia isto antes
> de tocar em qualquer arquivo.

---

## 1. O que é este projeto

A Central de Ferramentas é um workspace pessoal/empresarial que reúne
CRM, Projetos, Financeiro, Estoque, Tickets, Drive de arquivos, Agenda e
ferramentas de produtividade (Snippets, Prompts, Base de Conhecimento,
Portfólio) num só lugar, com **todos os dados conectados entre si**
(um cliente cadastrado no CRM pode ser usado em Projetos, Financeiro,
Agenda, Tickets etc., sem duplicar cadastro).

**Stack: HTML, CSS e JavaScript puros. Sem framework, sem build step, sem
backend (por enquanto).** Isso foi uma decisão explícita do usuário, não uma
limitação técnica — ver seção 9 antes de sugerir React/Vue/Node/etc.

---

## 2. Como rodar

Dê duplo-clique em `index.html`. Funciona offline, sem instalar nada.

Isso é possível porque o header/sidebar **não usam `fetch()`** (o que exigiria
servidor por causa de CORS em `file://`) — eles são gerados por JavaScript
puro em `assets/js/partials.js` e injetados via `innerHTML`.

---

## 3. Arquitetura em 30 segundos

- **Multi-página**: cada módulo é uma pasta com um ou mais `.html`. Não é uma
  SPA com router — navegação é por link `<a href>` normal.
- **Sem build**: nenhum `npm install`, sem bundler, sem transpilador. O que
  está no arquivo é exatamente o que roda no navegador.
- **Dados no navegador**: `localStorage` para dados estruturados (via
  `db.js`), `IndexedDB` só para o conteúdo binário de arquivos (Drive).
- **Shell compartilhado**: todo módulo importa os mesmos `tokens.css`,
  `base.css`, `components.css`, e os mesmos 5 scripts na mesma ordem.

```
central-de-ferramentas/
├── index.html                     → Dashboard
├── LEIA-ME.md                     → guia rápido de uso (para o usuário final)
├── DOCUMENTACAO-TECNICA.md        → este arquivo
│
├── assets/
│   ├── css/
│   │   ├── tokens.css             → cores, tipografia, tema claro/escuro
│   │   ├── base.css                → reset + grade do app-shell
│   │   └── components.css          → TODOS os componentes visuais reaproveitáveis
│   └── js/
│       ├── utils.js                 → helpers puros (datas, moeda, ids, markdown-lite...)
│       ├── events.js                → pub/sub de mudança de dados
│       ├── db.js                    → camada de dados sobre localStorage
│       ├── idb-arquivos.js          → blobs de arquivo sobre IndexedDB (só Drive/Tickets)
│       ├── catalogo-relatorios.js   → metadados de tabelas/campos + motor de agregação (só Relatórios)
│       ├── partials.js              → HTML do header e da sidebar (funções JS, sem fetch)
│       └── app-shell.js             → injeta header/sidebar, tema, navegação ativa, favoritos
│
├── crm/            → index.html (Clientes), produtos.html, funil.html, tarefas.html
├── projetos/       → index.html, kanban.html, lista.html
├── equipe/         → index.html
├── categorias/     → index.html
├── agenda/         → index.html
├── financeiro/     → index.html
├── estoque/        → index.html
├── drive/          → index.html
├── tickets/        → index.html
├── snippets/       → index.html
├── conhecimento/   → index.html (Base de Conhecimento)
├── prompts/        → index.html
└── portfolio/      → editar.html (interno) + index.html (página pública, sem sidebar)
```

---

## 4. Os 6 arquivos que TUDO usa (nunca duplicar, sempre editar na origem)

| Arquivo | Responsabilidade |
|---|---|
| `assets/css/tokens.css` | Variáveis CSS: cores (tema escuro é o padrão; vermelho `#E5484D` é a cor de marca), fontes (Space Grotesk / Inter / JetBrains Mono), raios, sombras |
| `assets/css/base.css` | Reset, grade do `.app-shell` (sidebar + header + main), import de fontes do Google |
| `assets/css/components.css` | Sidebar, header, botões, cards, badges, modal, kanban, tabela, calendário, checklist — todo componente visual novo entra aqui |
| `assets/js/utils.js` | Funções puras sem dependência de DOM: `gerarId`, `formatarData`, `formatarMoeda`, `formatarTamanho`, `iniciais`, `corParaIndice`, `escaparHTML`, `renderizarMarkdownLite`, `SLA_HORAS`/`calcularPrazoSLA`, `MESES_PT` |
| `assets/js/events.js` | `onDadosMudarem(tabela, callback)` e `avisarMudanca(tabela)` — pub/sub sobre `CustomEvent`, mais sincronização entre abas via evento `storage` |
| `assets/js/db.js` | Ver seção 5 |
| `assets/js/partials.js` | `sidebarHTML(raiz)` e `headerHTML()` — strings de template, não HTML separado |
| `assets/js/app-shell.js` | Roda no `DOMContentLoaded`: injeta partials, aplica tema salvo, marca o item ativo da sidebar (via `data-nav` == `body[data-module]`), roda `semearDadosIniciais()`, renderiza favoritos, e no final dispara `window.dispatchEvent(new CustomEvent("ctf:shell-pronto"))` — **todo código específico de página só deve rodar depois desse evento**, porque só aí o header/sidebar existem no DOM e os dados padrão já foram semeados. |

---

## 5. Camada de dados (`db.js`)

Trata `localStorage` como um banco relacional simples. **Nenhuma página deve
chamar `localStorage` diretamente** — sempre pelas funções abaixo, para que
no dia em que existir backend, só essas funções precisem virar `fetch()`.

```js
getAll(tabela)              // -> array de registros
getPorId(tabela, id)        // -> registro ou null
inserir(tabela, objeto)     // -> gera id + criadoEm, salva, retorna o registro criado
atualizar(tabela, id, alteracoes)  // -> merge raso, salva, retorna o registro atualizado
remover(tabela, id)         // -> remove pelo id
saveAll(tabela, array)      // -> sobrescreve a tabela inteira (usado quando o array já foi manipulado, ex: reordenar)
```

Toda tabela é uma chave `ctf_<nome>` no `localStorage`. A lista completa de
tabelas está em `DB_CHAVES` (topo de `db.js`) — **ao criar uma tabela nova,
adicione a chave ali E uma linha em `semearDadosIniciais()`** garantindo o
array vazio (`if (localStorage.getItem(DB_CHAVES.x) === null) saveAll("x", [])`),
senão páginas que leem essa tabela antes de qualquer inserção vão quebrar.

`semearDadosIniciais()` roda toda vez que o `app-shell.js` carrega, mas cada
tabela só é criada **se ainda não existir** — não sobrescreve dado real do
usuário, mesmo quando uma tabela nova é adicionada meses depois.

### 5.1 Modelo de dados atual (tabela → campos principais)

| Tabela | Campos | Observações |
|---|---|---|
| `clientes` | `nome, cor, contato, tags, observacoes` | `cor` vem de `corParaIndice()`, é o "fio condutor" visual usado em toda a plataforma |
| `projetos` | `nome, clienteId` | Kanban/Lista de tarefas ficam em `tarefas`, filtradas por `projetoId` |
| `tarefas` | `titulo, descricao, projetoId, coluna, responsavelId, prioridade, prazo, tags, bloqueadaPor, subtarefas[], comentarios[], codigo` | `coluna` referencia o `id` de um item em `kanbanColunas` (não mais string fixa); `bloqueadaPor` é o `id` de outra tarefa (dependência); `subtarefas`/`comentarios` ficam **embutidos no próprio registro**, não em tabelas separadas |
| `kanbanColunas` | `label` | Colunas do Kanban de Projetos — **globais**, valem para todos os projetos, editáveis em `projetos/kanban.html` → "Personalizar colunas" |
| `favoritos` | `tipo, refId` | `tipo` ∈ `cliente, projeto, snippet, artigo, prompt`; renderizado na sidebar por `app-shell.js` |
| `produtos` | `nome, preco, tipo` | Catálogo do CRM (`tipo`: `unico`/`recorrente`), usado no Funil de Vendas |
| `oportunidades` | `titulo, clienteId, produtoId, valor, etapa` | Funil de Vendas (Kanban); `etapa` ∈ `lead, contato, proposta, negociacao, ganho, perdido` |
| `tarefasCrm` | `titulo, clienteId, responsavelId, prioridade, prazo, coluna` | Kanban de follow-up do CRM; `coluna` ∈ `fazer, andamento, concluido` (fixas, diferente do Kanban de Projetos) |
| `eventos` | `titulo, data, hora, clienteId, projetoId, descricao` | Agenda |
| `lancamentos` | `tipo, descricao, valor, data, clienteId, projetoId, status` | Financeiro; `tipo` ∈ `entrada, saida`; `status` ∈ `pago, pendente` (cobre contas a pagar/receber sem tela separada) |
| `itensEstoque` | `nome, codigo, categoria, quantidade, estoqueMinimo` | |
| `movimentosEstoque` | `itemId, tipo, quantidade, motivo, data` | Histórico de entrada/saída de estoque |
| `arquivos` | `nome, tipo, tamanho, clienteId, projetoId, ticketId, categoria, tags` | **Metadados apenas** — o binário do arquivo vive no IndexedDB (ver `idb-arquivos.js`), indexado pelo mesmo `id` |
| `tickets` | `numero, titulo, descricao, clienteId, prioridade, status, responsavelId` | Service desk; SLA é **calculado**, não armazenado (`calcularPrazoSLA` em `utils.js`) |
| `ticketComentarios` | `ticketId, autor, texto, criadoEm` | |
| `ticketTempos` | `ticketId, minutos, descricao` | Tempo gasto por ticket |
| `snippets` | `titulo, linguagem, tags, codigo` | `linguagem` é o **nome** de uma categoria do grupo `"snippet"` em `categorias` |
| `artigos` | `titulo, categoria, tags, link, conteudo` | Base de Conhecimento; `conteudo` aceita a marcação de `renderizarMarkdownLite()`; `categoria` é o nome de uma categoria do grupo `"artigo"` |
| `prompts` | `titulo, categoria, tags, conteudo, ultimoUso` | `ultimoUso` (ISO date) é atualizado a cada cópia — alimenta a seção "Usados recentemente" |
| `equipe` | `nome, cargo, contato` | Compartilhado — usado como Responsável em Projetos, Tickets e Tarefas do CRM |
| `categorias` | `grupo, nome` | `grupo` ∈ `artigo, snippet, prompt` (ver `categorias/index.html` para adicionar novos grupos) |
| `logs` | `modulo, acao, data` | Log de atividades genérico via `registrarLog(modulo, acao)`; hoje só `projetos/kanban.html` e `projetos/index.html` chamam, mas qualquer módulo pode usar (ver `projetos/historico.html` como referência de leitura) |
| `metricas` | `nome, tabela, campo, agregacao, filtroCampo, filtroOperador, filtroValor` | Módulo Relatórios; `agregacao` ∈ `contagem, soma, media, minimo, maximo` |
| `relatorios` | `nome, descricao, publicado, blocos[]` | Cada item de `blocos` é `{id, tipo, titulo, largura, ...}`; `tipo` ∈ `kpi, barras, colunas, rosca, tabela`; `largura` ∈ `completa, metade, terco`; blocos `kpi` referenciam uma `metricaId`; blocos `tabela` têm `modo` ∈ `dados` (colunas brutas) ou `medidas` (agrupado por `campoAgrupador` + `metricaIds[]`, tipo tabela dinâmica) |
| `layouts` | `nome, padrao, slots[]` | Modelos de arranjo para novos relatórios; cada `slot` é `{tipo, largura}` (mesmos valores de `blocos`, sem dados ainda — só a "forma"); 3 vêm semeados (`padrao: true`) |
| `perfil` | registro único: `nome, cargo` | Como `portfolio` — acessado por `getPerfil()`/`salvarPerfil()`, não por `getAll`. Alimenta os avatares do header e da sidebar (ver `aplicarPerfilNosAvatares()` em `app-shell.js`) |
| `menuGrupos` | `nome, ordem` | Grupos configuráveis da sidebar (editável em `menu/index.html`) |
| `menuAtribuicoes` | `ferramentaChave, grupoId` | Em qual grupo cada ferramenta do catálogo aparece; ferramenta sem entrada aqui fica em "Sem grupo" (escondida da sidebar até ser arrastada para um grupo) |
| `portfolio` | registro único (não array): `nome, cargo, bio, tecnologias[], links{github,linkedin,blog}, experiencias[], certificados[], projetosDestaque[]` | Acessado por `getPortfolio()`/`salvarPortfolio()`, não por `getAll`/`inserir` |

Todo campo terminado em `Id` é uma referência (chave estrangeira "manual")
para o `id` de outra tabela. Não há integridade referencial automática —
cada módulo que permite excluir um registro referenciado por outro **deve
checar isso manualmente antes de excluir** (ver `excluirCliente()` em
`crm/index.html` e `excluirProduto()` em `crm/produtos.html` como exemplo:
bloqueiam a exclusão com um `alert()` se o registro estiver em uso).

---

## 6. Convenções que TODO módulo segue

1. **Idioma**: todo identificador (função, variável, campo de dado, texto de
   interface) é em português. Não misturar.
2. **`CTF_RAIZ`**: toda página define, antes de carregar os scripts, uma
   constante com o caminho relativo até a raiz do projeto:
   ```html
   <script>const CTF_RAIZ = "../";</script>   <!-- páginas 1 nível abaixo da raiz -->
   <script>const CTF_RAIZ = "./";</script>    <!-- só o index.html da raiz usa isso -->
   ```
   Isso é usado por `partials.js` para montar os links da sidebar corretamente
   não importa de onde a página foi aberta.
3. **Ordem fixa de scripts**, sempre:
   ```html
   <script src="../assets/js/utils.js"></script>
   <script src="../assets/js/events.js"></script>
   <script src="../assets/js/db.js"></script>
   <!-- idb-arquivos.js aqui, só se a página mexer com upload de arquivo -->
   <!-- catalogo-relatorios.js aqui, só nas páginas de relatorios/ -->
   <script src="../assets/js/catalogo-menu.js"></script>
   <script src="../assets/js/partials.js"></script>
   <script src="../assets/js/app-shell.js" defer></script>
   ```
   `catalogo-menu.js` é obrigatório em toda página que usa a sidebar (ou
   seja, toda página exceto `portfolio/index.html`, que é pública e não tem
   sidebar) — `partials.js` depende dele para montar os grupos.
4. **Tema aplicado antes do CSS**, sempre a primeira coisa no `<head>`:
   ```html
   <script>
     document.documentElement.dataset.theme = localStorage.getItem("ctf_tema") || "dark";
   </script>
   ```
   Isso evita o "flash" do tema errado (o CSS carrega depois, já lendo a
   variável certa).
5. **`data-module` no `<body>`** precisa bater com um `data-nav` em
   `partials.js` para a sidebar destacar o item certo:
   ```html
   <body data-module="projetos">
   ```
6. **Todo código específico da página fica dentro de**:
   ```js
   window.addEventListener("ctf:shell-pronto", () => { ... });
   ```
   porque só depois desse evento o `#app-header`/`#app-sidebar` foram
   preenchidos e `semearDadosIniciais()` já rodou.
7. **Reatividade simples**: depois de qualquer `inserir`/`atualizar`/`remover`/
   `saveAll`, chame a função de renderização da própria página na hora
   (`render...()`). Além disso, use `onDadosMudarem("tabela", callback)` para
   reagir a mudanças feitas por **outra aba** ou (futuramente) por outro
   componente da mesma página.
8. **Modal padrão**: reaproveite `.modal-backdrop` / `.modal` / `.modal-header`
   / `.modal-footer` de `components.css`. Use `.modal--largo` quando o
   conteúdo precisar de mais espaço (formulários com abas, por exemplo).
9. **Nunca duplique uma paleta de cor, fonte, ou componente visual** — se
   parece que precisa de um CSS novo, primeiro veja se já existe algo
   parecido em `components.css` antes de criar.

---

## 7. Como criar um módulo novo (passo a passo)

Exemplo: criar um módulo "Contratos".

1. Crie a pasta `contratos/` na raiz.
2. Copie o `<head>` e a estrutura de scripts de outro módulo simples (ex:
   `equipe/index.html` é um bom ponto de partida — CRUD simples com cards).
3. Ajuste `<title>`, `<body data-module="contratos">`.
4. Em `assets/js/db.js`:
   - adicione `contratos: "ctf_contratos"` em `DB_CHAVES`;
   - adicione `if (localStorage.getItem(DB_CHAVES.contratos) === null) saveAll("contratos", []);`
     dentro de `semearDadosIniciais()`.
5. Em `assets/js/catalogo-menu.js`, adicione um item em `CATALOGO_FERRAMENTAS`
   com `chave: "contratos"` (batendo com o `data-module` do passo 3), `nome`,
   `url: "contratos/index.html"` e um `icone` (SVG). **Não edite `partials.js`
   para isso** — a sidebar é montada a partir desse catálogo + dos grupos
   configuráveis. Depois de adicionar, abra "Configurar menu" na sidebar e
   arraste a ferramenta nova para o grupo desejado (sem isso, ela existe mas
   fica em "Sem grupo", invisível na sidebar até alguém arrastar).
6. Se o módulo precisa se referenciar a outro (ex: contrato pertence a um
   cliente), use um campo `clienteId` e popule um `<select>` a partir de
   `getAll("clientes")` — é assim que toda integração já existente funciona.
7. Se precisar de uma lista de opções que o próprio usuário deve poder
   editar (tipo "categoria de contrato"), **não** crie um `<option>` fixo:
   adicione um novo `grupo` em `categorias/index.html` (edite o array
   `GRUPOS` nesse arquivo) e leia com `getCategorias("grupo-novo")`.
8. Escreva a página seguindo os padrões da seção 6.
9. Teste abrindo o `index.html` da raiz e navegando até o módulo novo pela
   sidebar — não abra o arquivo do módulo direto na primeira vez, para
   garantir que os dados-padrão (`semearDadosIniciais`) já foram criados.

---

## 8. Como adicionar um campo/funcionalidade a um módulo existente

- **Campo novo num formulário existente**: adicione o `<input>`/`<select>`
  no modal, leia o valor em `salvar<Coisa>()` e inclua no objeto `dados`
  passado para `inserir`/`atualizar`. Como as tabelas são JSON livre (não
  schema fixo), isso não exige migração — registros antigos simplesmente não
  têm esse campo até serem editados (trate como `undefined`/`null` no
  código de exibição).
- **Nova relação entre módulos** (ex: linkar Tickets a Projetos): adicione
  o campo `projetoId` na tabela relevante, um `<select>` populado com
  `getAll("projetos")`, e exiba a referência nos cards/tabelas com
  `getPorId("projetos", registro.projetoId)`.
- **Novo componente visual**: adicione a classe em `components.css` (não
  em `<style>` dentro da página) para poder ser reaproveitado depois.
- **Nova tabela de apoio embutida num registro** (como `subtarefas` e
  `comentarios` dentro de `tarefas`): só faz sentido quando os dados
  **sempre são acessados junto com o "pai"** (não precisam de listagem
  própria). Caso contrário, crie uma tabela separada com uma FK manual
  (como `ticketComentarios.ticketId`).

---

## 9. Decisões de arquitetura — e por quê (não reverter sem avisar o usuário)

- **HTML/CSS/JS puro, multi-página, sem build**: pedido explícito do
  usuário para padronizar tudo nesse formato. Não sugerir React/Vue,
  bundlers, ou frameworks CSS sem que o usuário peça.
  Também foi pedido explicitamente rodar **sem servidor** (duplo-clique),
  por isso o header/sidebar são gerados por JS puro em vez de `fetch()`
  de arquivos `.html` parciais.
- **Tema escuro como padrão, vermelho `#E5484D` como cor de marca**: decisão
  visual explícita do usuário. A cor de marca é usada só em ações/destaques;
  estados de erro/perigo usam um vermelho mais escuro e dessaturado
  (`--danger`) para não gerar ambiguidade.
- **`localStorage` para dados estruturados, `IndexedDB` só para arquivos
  binários**: `localStorage` tem poucos MB e só guarda texto — inviável
  para PDFs/imagens reais sem estourar o limite. `IndexedDB` resolve isso
  sem precisar de servidor.
- **Colunas de Kanban por `id` estável, não pelo nome**: assim renomear uma
  coluna não quebra as tarefas que já estão nela (diferente da referência
  que serviu de base para esse módulo, que usava o nome como identificador).
- **Responsável = Equipe (select), não texto livre**: para o mesmo nome não
  virar "pessoas diferentes" por causa de digitação inconsistente entre
  módulos.
- **Sem backend por enquanto**: é a fase atual do roadmap, não uma limitação
  permanente. Toda a camada `db.js` foi desenhada para que migrar para uma
  API real signifique trocar só as funções internas de `db.js` — nenhuma
  página que já usa `getAll`/`inserir`/`atualizar`/`remover` precisará ser
  reescrita.
- **Modais rolam pelo fundo (`.modal-backdrop`), não por dentro da caixinha
  (`.modal`)**: decisão explícita do usuário — não queria a barra de rolagem
  "presa" dentro do modal. `.modal` não tem `max-height`/`overflow`, cresce
  com o conteúdo; quem rola é o fundo escuro. Não reintroduza
  `max-height`/`overflow-y` em `.modal` ao criar um modal novo.

---

## 10. Limitações conhecidas (não são bugs, são o estado atual do projeto)

- **Dado é local ao navegador**: `localStorage`/`IndexedDB` não sincronizam
  entre dispositivos nem pessoas. É uma ferramenta pessoal/single-user por
  enquanto.
- **Sem autenticação**: qualquer pessoa com acesso ao navegador vê tudo.
- **Sem integridade referencial automática**: excluir um registro referenciado
  em outro lugar só é bloqueado onde isso foi implementado manualmente (ver
  seção 5). Ao criar uma relação nova, considere se precisa desse bloqueio.
- **Kanban de Projetos tem colunas globais** (uma lista só, vale para todos
  os projetos) — o Kanban de Tarefas do CRM (`crm/tarefas.html`) tem colunas
  fixas próprias (`fazer/andamento/concluido`), não usa `kanbanColunas`.
  São dois quadros independentes de propósito.
- **`portfolio/index.html` é a única página pública** (sem sidebar/tema
  interno) — pensada para ser aberta/compartilhada fora do contexto da
  ferramenta interna.

---

## 11. Pendências / próximos passos possíveis

- Retrofitar `Equipe` como Responsável em outros módulos que ainda usam
  texto livre (se algum ficou de fora — checar antes de assumir que já foi
  feito, revisando o próprio módulo).
- Avaliar se **Estoque**, **Drive** e **Portfólio** precisam de mais vínculos
  cruzados com Cliente/Projeto (não foram revisados na última rodada de
  integração).
- Migração para backend real (ver seção 9 — trocar as funções internas de
  `db.js`, resto do código não muda).
- Ver `LEIA-ME.md` para o histórico módulo a módulo de tudo que já foi
  construído, na ordem em que foi pedido.

---

## 12. Para outra IA que for continuar este projeto

- **Leia este arquivo inteiro antes de editar qualquer coisa.**
- Não introduza framework, bundler, CSS-in-JS, ou dependência de CDN nova
  sem confirmar com o usuário — é uma restrição de projeto, não uma
  sugestão.
- Sempre que adicionar uma tabela em `db.js`, siga o padrão da seção 5
  (chave em `DB_CHAVES` + linha em `semearDadosIniciais()`).
- Sempre que criar um módulo, siga a seção 7 à risca — a sidebar, o tema, e
  a navegação ativa **dependem** de `data-module`/`data-nav` baterem e de
  `CTF_RAIZ` estar certo.
- Prefira reaproveitar uma classe de `components.css` a criar CSS novo
  inline. Se precisar de um componente genuinamente novo, adicione-o em
  `components.css`, comentado, na mesma convenção das seções existentes.
- Este projeto já passou por várias rodadas de padronização pedidas
  explicitamente pelo usuário (ver seção 9). Trate o padrão atual como
  requisito, não como sugestão a ser "melhorada" silenciosamente.
