/* ==========================================================================
   CATALOGO-MENU.JS — a lista de TODAS as ferramentas/telas que existem no
   sistema (nome, ícone, url). Isso é fixo — corresponde às páginas reais.

   O que É configurável pelo usuário é em qual GRUPO cada ferramenta aparece
   na sidebar (tabelas `menuGrupos` e `menuAtribuicoes` em db.js), editável
   em menu/index.html.

   Ao criar um módulo novo, adicione uma linha aqui com uma `chave` que bata
   com o `data-module`/`data-nav` da página (ver seção 6 da documentação
   técnica) — daí ele já aparece disponível para ser posto num grupo.

   Carregar depois de db.js e antes de partials.js.
   ========================================================================== */

const CATALOGO_FERRAMENTAS = [
  { chave: "crm-clientes", nome: "Clientes", url: "crm/index.html",
    icone: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.6 2.9-6 5.5-6s5.5 2.4 5.5 6"/><circle cx="17.5" cy="8.5" r="2.4"/><path d="M15.3 14.3c2.3.3 4.2 2.4 4.2 5.7"/>' },
  { chave: "crm-funil", nome: "Funil de Vendas", url: "crm/funil.html",
    icone: '<path d="M4 4h16l-6 8v6l-4 2v-8z"/>' },
  { chave: "crm-tarefas", nome: "Tarefas (CRM)", url: "crm/tarefas.html",
    icone: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="m8 12 2.5 2.5L16 9"/>' },
  { chave: "crm-produtos", nome: "Produtos", url: "crm/produtos.html",
    icone: '<path d="M20 7 12 3 4 7v10l8 4 8-4z"/><path d="M4 7l8 4 8-4M12 11v10"/>' },
  { chave: "projetos", nome: "Projetos", url: "projetos/index.html",
    icone: '<path d="M3 7a1.5 1.5 0 0 1 1.5-1.5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9.5V17a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17z"/>' },
  { chave: "equipe", nome: "Equipe", url: "equipe/index.html",
    icone: '<circle cx="9" cy="7" r="3.2"/><circle cx="17" cy="8" r="2.4"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5M15.5 13.8c2.3.3 4 2.2 4 4.7"/>' },
  { chave: "tickets", nome: "Tickets", url: "tickets/index.html",
    icone: '<path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.2a2 2 0 0 0 0 3.6V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.2a2 2 0 0 0 0-3.6z"/>' },
  { chave: "financeiro", nome: "Financeiro", url: "financeiro/index.html",
    icone: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>' },
  { chave: "estoque", nome: "Estoque", url: "estoque/index.html",
    icone: '<path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>' },
  { chave: "agenda", nome: "Agenda", url: "agenda/index.html",
    icone: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>' },
  { chave: "relatorios", nome: "Meus Relatórios", url: "relatorios/index.html",
    icone: '<path d="M4 19V9m6 10V5m6 14v-7"/><path d="M3 19h18"/>' },
  { chave: "relatorios-dados", nome: "Dados (tabelas)", url: "relatorios/dados.html",
    icone: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>' },
  { chave: "relatorios-metricas", nome: "Métricas", url: "relatorios/metricas.html",
    icone: '<path d="M3 3v18h18"/><path d="m7 15 3.5-4.5 3 3L19 8"/>' },
  { chave: "relatorios-layouts", nome: "Layouts", url: "relatorios/layouts.html",
    icone: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
  { chave: "drive", nome: "Drive de Arquivos", url: "drive/index.html",
    icone: '<path d="M12 3v10m0 0-3.5-3.5M12 13l3.5-3.5"/><path d="M4.5 15.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/>' },
  { chave: "perfil", nome: "Perfil", url: "perfil/index.html",
    icone: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/>' },
  { chave: "portfolio", nome: "Portfólio", url: "portfolio/editar.html",
    icone: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/>' },
  { chave: "snippets", nome: "Snippets", url: "snippets/index.html",
    icone: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"/>' },
  { chave: "conhecimento", nome: "Base de Conhecimento", url: "conhecimento/index.html",
    icone: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' },
  { chave: "categorias", nome: "Categorias", url: "categorias/index.html",
    icone: '<path d="M20.6 12.3 12.3 20.6a2 2 0 0 1-2.8 0l-7-7a2 2 0 0 1 0-2.9L10.7 2.5a2 2 0 0 1 1.5-.5h7a1 1 0 0 1 1 1v7a2 2 0 0 1-.5 1.3z"/><circle cx="15.5" cy="7.5" r="1"/>' },
  { chave: "prompts", nome: "Prompts", url: "prompts/index.html",
    icone: '<path d="M4 4h16v12H8l-4 4z"/>' },
  { chave: "valor-ajuste", nome: "Valor Conta & Ajuste", url: "valor-ajuste/index.html",
    icone: '<path d="M4 4h16v16H4z"/><path d="M8 8h.01M8 16h.01M16 8l-8 8"/>' },
];

function obterFerramentaCatalogo(chave) {
  return CATALOGO_FERRAMENTAS.find((f) => f.chave === chave);
}

/** Ferramentas atribuídas a um grupo, na ordem em que foram atribuídas. */
function ferramentasDoGrupo(grupoId) {
  return getAll("menuAtribuicoes")
    .filter((a) => a.grupoId === grupoId)
    .map((a) => obterFerramentaCatalogo(a.ferramentaChave))
    .filter(Boolean);
}

/** Ferramentas que existem no catálogo mas ainda não foram postas em nenhum grupo. */
function ferramentasSemGrupo() {
  const atribuidas = new Set(getAll("menuAtribuicoes").map((a) => a.ferramentaChave));
  return CATALOGO_FERRAMENTAS.filter((f) => !atribuidas.has(f.chave));
}

/** Move (ou remove, se grupoId for null) uma ferramenta para um grupo. */
function moverFerramentaParaGrupo(ferramentaChave, grupoId) {
  const atribuicoes = getAll("menuAtribuicoes");
  const existente = atribuicoes.find((a) => a.ferramentaChave === ferramentaChave);
  if (grupoId === null) {
    if (existente) remover("menuAtribuicoes", existente.id);
  } else if (existente) {
    atualizar("menuAtribuicoes", existente.id, { grupoId });
  } else {
    inserir("menuAtribuicoes", { ferramentaChave, grupoId });
  }
}
