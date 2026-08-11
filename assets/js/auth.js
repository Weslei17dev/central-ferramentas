/* ==========================================================================
   AUTH.JS — login/cadastro/sessão contra a NOSSA API (server/), não mais
   um provedor externo. Endpoints usados: POST /api/auth/login,
   POST /api/auth/cadastro (ver server/src/routes/auth.js).

   Carregar depois de config.js e antes de db.js.
   ========================================================================== */

const CTF_SESSAO_CHAVE = "ctf_sessao"; // { token, usuario: { id, nome, email } }

function obterSessao() {
  return JSON.parse(localStorage.getItem(CTF_SESSAO_CHAVE) || "null");
}
function salvarSessao(sessao) {
  localStorage.setItem(CTF_SESSAO_CHAVE, JSON.stringify(sessao));
}
function limparSessao() {
  localStorage.removeItem(CTF_SESSAO_CHAVE);
}
function estaLogado() {
  return !!obterSessao()?.token;
}
function obterToken() {
  return obterSessao()?.token || "";
}

/** Cabeçalhos prontos para chamar a API (usado por db.js). */
function cabecalhosAutenticados() {
  return { Authorization: `Bearer ${obterToken()}` };
}

async function fazerLogin(email, senha) {
  const resposta = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || "E-mail ou senha incorretos.");
  salvarSessao({ token: dados.token, usuario: dados.usuario });
  return dados.usuario;
}

async function fazerCadastro(nome, email, senha) {
  const resposta = await fetch(`${API_BASE_URL}/api/auth/cadastro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || "Não foi possível criar a conta.");
  salvarSessao({ token: dados.token, usuario: dados.usuario });
  return dados.usuario;
}

function sair() {
  limparSessao();
  const raiz = typeof CTF_RAIZ !== "undefined" ? CTF_RAIZ : "./";
  window.location.href = `${raiz}login.html`;
}

/** Chame no topo de toda página protegida (depois de auth.js carregar). */
function exigirLogin() {
  if (estaLogado()) return;
  const raiz = typeof CTF_RAIZ !== "undefined" ? CTF_RAIZ : "./";
  window.location.href = `${raiz}login.html`;
}
