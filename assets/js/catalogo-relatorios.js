/* ==========================================================================
   CATALOGO-RELATORIOS.JS — descreve, para cada tabela do db.js, quais campos
   existem e de que tipo são (texto, numero, data, categoria, referencia).
   É a "camada de metadados" que faltava, já que as tabelas são JSON livre.

   Também tem o motor de agregação usado por Métricas e pelo Construtor de
   Relatórios. Nenhum gráfico/KPI calcula nada sozinho — tudo passa por aqui.

   Carregar depois de db.js, só nas páginas do módulo Relatórios.
   ========================================================================== */

const CATALOGO_TABELAS = [
  { tabela: "clientes", rotulo: "Clientes", campos: [
    { chave: "nome", rotulo: "Nome", tipo: "categoria" },
    { chave: "contato", rotulo: "Contato", tipo: "texto" },
    { chave: "tags", rotulo: "Etiquetas", tipo: "lista" },
    { chave: "observacoes", rotulo: "Observações", tipo: "texto" },
    { chave: "criadoEm", rotulo: "Criado em", tipo: "data" },
  ]},
  { tabela: "projetos", rotulo: "Projetos", campos: [
    { chave: "nome", rotulo: "Nome", tipo: "categoria" },
    { chave: "clienteId", rotulo: "Cliente", tipo: "referencia", tabelaRef: "clientes", campoRef: "nome" },
    { chave: "criadoEm", rotulo: "Criado em", tipo: "data" },
  ]},
  { tabela: "tarefas", rotulo: "Tarefas de Projetos", campos: [
    { chave: "titulo", rotulo: "Título", tipo: "texto" },
    { chave: "descricao", rotulo: "Descrição", tipo: "texto" },
    { chave: "projetoId", rotulo: "Projeto", tipo: "referencia", tabelaRef: "projetos", campoRef: "nome" },
    { chave: "responsavelId", rotulo: "Responsável", tipo: "referencia", tabelaRef: "equipe", campoRef: "nome" },
    { chave: "prioridade", rotulo: "Prioridade", tipo: "categoria" },
    { chave: "coluna", rotulo: "Coluna (status)", tipo: "categoria-coluna" },
    { chave: "tags", rotulo: "Tags", tipo: "lista" },
    { chave: "prazo", rotulo: "Prazo", tipo: "data" },
  ]},
  { tabela: "produtos", rotulo: "Produtos (CRM)", campos: [
    { chave: "nome", rotulo: "Nome", tipo: "categoria" },
    { chave: "preco", rotulo: "Preço", tipo: "numero" },
    { chave: "tipo", rotulo: "Tipo", tipo: "categoria" },
  ]},
  { tabela: "oportunidades", rotulo: "Oportunidades (Funil)", campos: [
    { chave: "titulo", rotulo: "Título", tipo: "texto" },
    { chave: "clienteId", rotulo: "Cliente", tipo: "referencia", tabelaRef: "clientes", campoRef: "nome" },
    { chave: "produtoId", rotulo: "Produto", tipo: "referencia", tabelaRef: "produtos", campoRef: "nome" },
    { chave: "valor", rotulo: "Valor", tipo: "numero" },
    { chave: "etapa", rotulo: "Etapa do funil", tipo: "categoria" },
  ]},
  { tabela: "lancamentos", rotulo: "Financeiro (Lançamentos)", campos: [
    { chave: "descricao", rotulo: "Descrição", tipo: "texto" },
    { chave: "tipo", rotulo: "Tipo (entrada/saída)", tipo: "categoria" },
    { chave: "valor", rotulo: "Valor", tipo: "numero" },
    { chave: "status", rotulo: "Status", tipo: "categoria" },
    { chave: "clienteId", rotulo: "Cliente", tipo: "referencia", tabelaRef: "clientes", campoRef: "nome" },
    { chave: "projetoId", rotulo: "Projeto", tipo: "referencia", tabelaRef: "projetos", campoRef: "nome" },
    { chave: "data", rotulo: "Data", tipo: "data" },
  ]},
  { tabela: "itensEstoque", rotulo: "Estoque (Itens)", campos: [
    { chave: "nome", rotulo: "Nome", tipo: "categoria" },
    { chave: "codigo", rotulo: "Código/SKU", tipo: "texto" },
    { chave: "categoria", rotulo: "Categoria", tipo: "categoria" },
    { chave: "quantidade", rotulo: "Quantidade", tipo: "numero" },
    { chave: "estoqueMinimo", rotulo: "Estoque mínimo", tipo: "numero" },
  ]},
  { tabela: "movimentosEstoque", rotulo: "Estoque (Movimentações)", campos: [
    { chave: "itemId", rotulo: "Item", tipo: "referencia", tabelaRef: "itensEstoque", campoRef: "nome" },
    { chave: "tipo", rotulo: "Tipo (entrada/saída)", tipo: "categoria" },
    { chave: "quantidade", rotulo: "Quantidade", tipo: "numero" },
    { chave: "motivo", rotulo: "Motivo", tipo: "texto" },
    { chave: "data", rotulo: "Data", tipo: "data" },
  ]},
  { tabela: "tickets", rotulo: "Tickets", campos: [
    { chave: "numero", rotulo: "Número", tipo: "numero" },
    { chave: "titulo", rotulo: "Título", tipo: "texto" },
    { chave: "descricao", rotulo: "Descrição", tipo: "texto" },
    { chave: "clienteId", rotulo: "Cliente", tipo: "referencia", tabelaRef: "clientes", campoRef: "nome" },
    { chave: "responsavelId", rotulo: "Responsável", tipo: "referencia", tabelaRef: "equipe", campoRef: "nome" },
    { chave: "prioridade", rotulo: "Prioridade", tipo: "categoria" },
    { chave: "status", rotulo: "Status", tipo: "categoria" },
  ]},
  { tabela: "eventos", rotulo: "Agenda (Eventos)", campos: [
    { chave: "titulo", rotulo: "Título", tipo: "texto" },
    { chave: "data", rotulo: "Data", tipo: "data" },
    { chave: "clienteId", rotulo: "Cliente", tipo: "referencia", tabelaRef: "clientes", campoRef: "nome" },
    { chave: "projetoId", rotulo: "Projeto", tipo: "referencia", tabelaRef: "projetos", campoRef: "nome" },
  ]},
  { tabela: "equipe", rotulo: "Equipe", campos: [
    { chave: "nome", rotulo: "Nome", tipo: "categoria" },
    { chave: "cargo", rotulo: "Cargo", tipo: "categoria" },
    { chave: "contato", rotulo: "Contato", tipo: "texto" },
  ]},
  { tabela: "snippets", rotulo: "Snippets", campos: [
    { chave: "titulo", rotulo: "Título", tipo: "texto" },
    { chave: "linguagem", rotulo: "Linguagem", tipo: "categoria" },
    { chave: "tags", rotulo: "Tags", tipo: "lista" },
  ]},
  { tabela: "artigos", rotulo: "Base de Conhecimento", campos: [
    { chave: "titulo", rotulo: "Título", tipo: "texto" },
    { chave: "categoria", rotulo: "Categoria", tipo: "categoria" },
    { chave: "tags", rotulo: "Tags", tipo: "lista" },
    { chave: "link", rotulo: "Link", tipo: "texto" },
  ]},
  { tabela: "prompts", rotulo: "Prompts", campos: [
    { chave: "titulo", rotulo: "Título", tipo: "texto" },
    { chave: "categoria", rotulo: "Categoria", tipo: "categoria" },
    { chave: "tags", rotulo: "Tags", tipo: "lista" },
    { chave: "ultimoUso", rotulo: "Último uso", tipo: "data" },
  ]},
];

const AGREGACOES = [
  { chave: "contagem", rotulo: "Contagem de registros" },
  { chave: "soma", rotulo: "Soma" },
  { chave: "media", rotulo: "Média" },
  { chave: "minimo", rotulo: "Mínimo" },
  { chave: "maximo", rotulo: "Máximo" },
];

function obterTabelaCatalogo(tabela) {
  return CATALOGO_TABELAS.find((t) => t.tabela === tabela);
}
function obterCampoCatalogo(tabela, campoChave) {
  return obterTabelaCatalogo(tabela)?.campos.find((c) => c.chave === campoChave);
}

/** Resolve o valor de exibição de um campo, seguindo referência se for o caso. */
function resolverValorCampo(registro, campoDef) {
  if (!campoDef) return "";
  const bruto = registro[campoDef.chave];
  if (campoDef.tipo === "referencia") {
    if (!bruto) return "(nenhum)";
    const ref = getPorId(campoDef.tabelaRef, bruto);
    return ref ? ref[campoDef.campoRef] : "(removido)";
  }
  if (campoDef.tipo === "categoria-coluna") {
    const coluna = getAll("kanbanColunas").find((c) => c.id === bruto);
    return coluna ? coluna.label : bruto;
  }
  if (campoDef.tipo === "lista") return Array.isArray(bruto) ? bruto.join(", ") : bruto ?? "";
  if (campoDef.tipo === "data" && bruto) return formatarData(bruto);
  return bruto ?? "";
}

/** Aplica um filtro simples (campo/operador/valor) a uma lista de registros. */
function aplicarFiltro(registros, filtro) {
  if (!filtro || !filtro.campo) return registros;
  return registros.filter((r) => {
    const valor = r[filtro.campo];
    switch (filtro.operador) {
      case "diferente": return String(valor) !== String(filtro.valor);
      case "maior": return Number(valor) > Number(filtro.valor);
      case "menor": return Number(valor) < Number(filtro.valor);
      default: return String(valor) === String(filtro.valor); // "igual"
    }
  });
}

/** Calcula uma agregação simples (sem agrupar) sobre uma tabela inteira — usado pelos KPIs. */
function calcularAgregacao(tabela, campoChave, agregacao, filtro) {
  let registros = getAll(tabela);
  registros = aplicarFiltro(registros, filtro);
  if (agregacao === "contagem") return registros.length;
  const valores = registros.map((r) => Number(r[campoChave]) || 0);
  if (valores.length === 0) return 0;
  if (agregacao === "soma") return valores.reduce((a, b) => a + b, 0);
  if (agregacao === "media") return valores.reduce((a, b) => a + b, 0) / valores.length;
  if (agregacao === "minimo") return Math.min(...valores);
  if (agregacao === "maximo") return Math.max(...valores);
  return 0;
}

/**
 * Tabela de medidas: agrupa `tabela` por `campoAgrupador` e calcula, para cada
 * grupo, o valor de cada métrica em `metricaIds` (todas devem ser da mesma
 * tabela do agrupador). Retorna [{ grupo, valores: { metricaId: numero } }].
 */
function tabelaDeMedidas(tabela, campoAgrupador, metricaIds) {
  const metricas = metricaIds.map((id) => getPorId("metricas", id)).filter(Boolean);
  const defAgrupador = obterCampoCatalogo(tabela, campoAgrupador);
  const registros = getAll(tabela);

  const grupos = {};
  registros.forEach((r) => {
    const chave = resolverValorCampo(r, defAgrupador) || "(vazio)";
    (grupos[chave] = grupos[chave] || []).push(r);
  });

  return Object.entries(grupos).map(([grupo, regs]) => {
    const valores = {};
    metricas.forEach((m) => {
      let subset = m.filtroCampo ? aplicarFiltro(regs, { campo: m.filtroCampo, operador: m.filtroOperador, valor: m.filtroValor }) : regs;
      if (m.agregacao === "contagem") { valores[m.id] = subset.length; return; }
      const nums = subset.map((r) => Number(r[m.campo]) || 0);
      if (nums.length === 0) { valores[m.id] = 0; return; }
      if (m.agregacao === "soma") valores[m.id] = nums.reduce((a, b) => a + b, 0);
      else if (m.agregacao === "media") valores[m.id] = nums.reduce((a, b) => a + b, 0) / nums.length;
      else if (m.agregacao === "minimo") valores[m.id] = Math.min(...nums);
      else if (m.agregacao === "maximo") valores[m.id] = Math.max(...nums);
    });
    return { grupo, valores };
  }).sort((a, b) => a.grupo.localeCompare(b.grupo));
}
function agruparEAgregar(tabela, campoValorChave, agregacao, campoAgrupadorChave, filtro) {
  let registros = getAll(tabela);
  registros = aplicarFiltro(registros, filtro);
  const defAgrupador = obterCampoCatalogo(tabela, campoAgrupadorChave);

  const grupos = {};
  registros.forEach((r) => {
    const chave = resolverValorCampo(r, defAgrupador) || "(vazio)";
    (grupos[chave] = grupos[chave] || []).push(r);
  });

  return Object.entries(grupos)
    .map(([chave, regs]) => {
      let valor;
      if (agregacao === "contagem") valor = regs.length;
      else {
        const valores = regs.map((r) => Number(r[campoValorChave]) || 0);
        if (agregacao === "soma") valor = valores.reduce((a, b) => a + b, 0);
        else if (agregacao === "media") valor = valores.reduce((a, b) => a + b, 0) / valores.length;
        else if (agregacao === "minimo") valor = Math.min(...valores);
        else if (agregacao === "maximo") valor = Math.max(...valores);
      }
      return { chave: String(chave), valor };
    })
    .sort((a, b) => b.valor - a.valor);
}
