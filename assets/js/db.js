/* ==========================================================================
   DB.JS — fala com a NOSSA API (server/), hospedada na Render, que por sua
   vez fala com o Postgres (Neon). Substitui de vez a versão localStorage.

   MUDANÇA IMPORTANTE: toda função aqui é ASSÍNCRONA (retorna Promise),
   porque agora é uma chamada de rede de verdade. Todo lugar no código que
   chamava getAll/inserir/atualizar/remover precisa usar `await` (e a
   função que chama precisa ser `async`). Ver docs/MIGRACAO-BACKEND.md para
   o que já foi convertido (crm/index.html, como referência) e o que falta.

   Nomes das funções continuam os mesmos de propósito — só ganharam
   `async`/`await` por dentro — para minimizar o quanto cada página precisa
   mudar.

   Carregar depois de config.js e auth.js.
   ========================================================================== */

/* ---------- Conversão camelCase (JS) <-> snake_case (Postgres) ---------- */
function paraSnake(chave) {
  return chave.replace(/([A-Z])/g, "_$1").toLowerCase();
}
function paraCamel(chave) {
  return chave.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}
function linhaParaSnake(objeto) {
  const saida = {};
  for (const chave in objeto) saida[paraSnake(chave)] = objeto[chave];
  return saida;
}
function linhaParaCamel(objeto) {
  if (!objeto || typeof objeto !== "object") return objeto;
  const saida = {};
  for (const chave in objeto) saida[paraCamel(chave)] = objeto[chave];
  return saida;
}

/* ---------- Chamada crua à nossa API ---------- */
async function requisitarApi(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_BASE_URL}/api${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...cabecalhosAutenticados(),
      ...(opcoes.headers || {}),
    },
  });
  if (resposta.status === 401) {
    sair(); // sessão expirou ou é inválida — manda para o login
    throw new Error("Sessão expirada.");
  }
  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    throw new Error(dados?.erro || `Erro ${resposta.status} em ${caminho}`);
  }
  return dados;
}

/* ---------- CRUD genérico (assíncrono) ---------- */
async function getAll(tabela) {
  const linhas = await requisitarApi(`/${paraSnake(tabela)}`);
  return (linhas || []).map(linhaParaCamel);
}

async function getPorId(tabela, id) {
  const linha = await requisitarApi(`/${paraSnake(tabela)}/${id}`);
  return linha ? linhaParaCamel(linha) : null;
}

async function inserir(tabela, objeto) {
  const linha = await requisitarApi(`/${paraSnake(tabela)}`, {
    method: "POST",
    body: JSON.stringify(linhaParaSnake(objeto)),
  });
  avisarMudanca(tabela);
  return linhaParaCamel(linha);
}

async function atualizar(tabela, id, alteracoes) {
  const linha = await requisitarApi(`/${paraSnake(tabela)}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(linhaParaSnake(alteracoes)),
  });
  avisarMudanca(tabela);
  return linha ? linhaParaCamel(linha) : null;
}

async function remover(tabela, id) {
  await requisitarApi(`/${paraSnake(tabela)}/${id}`, { method: "DELETE" });
  avisarMudanca(tabela);
}

/**
 * NÃO EXISTE MAIS "sobrescrever a tabela inteira" numa API de rede — isso
 * era um atalho do localStorage. Páginas que ainda chamam saveAll(...)
 * (ex: reordenar colunas do Kanban) precisam ser convertidas para uma
 * sequência de inserir/atualizar/remover. Até lá, isso avisa alto em vez
 * de falhar em silêncio.
 */
async function saveAll(tabela) {
  throw new Error(`saveAll("${tabela}") ainda não foi convertido para a API — ver docs/MIGRACAO-BACKEND.md.`);
}

/* ---------- Favoritos ---------- */
async function alternarFavorito(tipo, id) {
  const favoritos = await getAll("favoritos");
  const existente = favoritos.find((f) => f.tipo === tipo && f.refId === id);
  if (existente) await remover("favoritos", existente.id);
  else await inserir("favoritos", { tipo, refId: id });
}

/* ---------- Perfil (rota própria: /api/perfil, sempre "o meu") ---------- */
async function getPerfil() {
  try {
    const perfil = await requisitarApi("/perfil");
    return linhaParaCamel(perfil);
  } catch {
    const sessao = obterSessao();
    return { nome: sessao?.usuario?.nome || "Você", cargo: "" };
  }
}

async function salvarPerfil(dados) {
  await requisitarApi("/perfil", { method: "PUT", body: JSON.stringify(dados) });
  avisarMudanca("perfil");
}

/* ---------- Portfólio (rota própria: /api/portfolio, leitura é pública) ---------- */
async function getPortfolio() {
  const dados = await requisitarApi("/portfolio");
  return dados ? linhaParaCamel(dados) : {
    nome: "", cargo: "", bio: "", tecnologias: [], links: {},
    experiencias: [], certificados: [], projetosDestaque: [],
  };
}

async function salvarPortfolio(dados) {
  await requisitarApi("/portfolio", { method: "PUT", body: JSON.stringify(dados) });
  avisarMudanca("portfolio");
}

/* ---------- Substituía a semeadura local; agora é feita 1x via server/db/schema.sql ---------- */
function semearDadosIniciais() {
  // no-op: os dados padrão (colunas do Kanban, layouts, grupos do menu)
  // já são inseridos por server/db/schema.sql. Mantido só para o
  // app-shell.js não quebrar ao chamar essa função.
}

/* ==========================================================================
   AINDA NÃO CONVERTIDAS — estas funções auxiliares existiam na versão
   localStorage e várias páginas ainda as chamam de forma síncrona. Elas
   ficam aqui como checklist do que fazer: reescrever no mesmo padrão de
   getAll/inserir acima (trocar leitura direta de array por
   `await getAll(...)`, marcar a própria função como `async`), e dar
   `await` em quem chama.
   ========================================================================== */

// getCategorias(grupo), getOportunidadesComDados(), getProjetosComCliente(),
// registrarLog(modulo,acao), calcularAgregacao(...), agruparEAgregar(...),
// tabelaDeMedidas(...)
