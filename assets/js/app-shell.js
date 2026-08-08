/* ==========================================================================
   APP-SHELL.JS — injeta header/sidebar (gerados por partials.js, sem fetch
   de HTML — só de dados), aplica o tema, destaca o módulo ativo, e agora
   também EXIGE LOGIN (versão hospedada com Neon Auth).

   Como getAll/getPorId/getPerfil etc. viraram assíncronos (db.js fala com
   o Neon pela rede), este arquivo inteiro roda em cima de await/async —
   se você copiar padrões daqui para uma página nova, mantenha async/await.

   Cada página deve definir, ANTES de carregar este arquivo, a variável:
     const CTF_RAIZ = "./";   // se a página está na raiz do projeto
     const CTF_RAIZ = "../";  // se a página está uma pasta abaixo (crm/, projetos/)

   Carregar por último, com `defer`.
   ========================================================================== */

function aplicarTema(tema) {
  document.documentElement.dataset.theme = tema;
  localStorage.setItem("ctf_tema", tema);
  const icone = document.getElementById("icone-tema");
  if (icone) {
    icone.innerHTML =
      tema === "dark"
        ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
        : '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>';
  }
}

function destacarModuloAtivo() {
  const moduloAtual = document.body.dataset.module;
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.classList.toggle("active", el.dataset.nav === moduloAtual);
  });
  // Garante que o grupo do item ativo apareça aberto, mesmo se estava
  // colapsado — só nesta visita, não altera a preferência salva do usuário.
  const ativo = document.querySelector('[data-nav].active');
  const grupoContainer = ativo?.closest('[data-grupo-itens]');
  if (grupoContainer) {
    grupoContainer.classList.remove('fechado');
    const header = document.querySelector(`[data-grupo-toggle="${grupoContainer.dataset.grupoItens}"] .chevron`);
    header?.classList.add('aberto');
  }
}

function alternarGrupoMenu(grupoId) {
  const container = document.querySelector(`[data-grupo-itens="${grupoId}"]`);
  const chevron = document.querySelector(`[data-grupo-toggle="${grupoId}"] .chevron`);
  const fechado = container.classList.toggle('fechado');
  chevron?.classList.toggle('aberto', !fechado);
  const estado = JSON.parse(localStorage.getItem('ctf_menu_expandido') || '{}');
  estado[grupoId] = !fechado;
  localStorage.setItem('ctf_menu_expandido', JSON.stringify(estado));
}

async function aplicarPerfilNosAvatares() {
  if (typeof getPerfil !== "function") return;
  const perfil = await getPerfil();
  const texto = typeof iniciais === "function" ? iniciais(perfil.nome) : perfil.nome.slice(0, 2).toUpperCase();
  const header = document.getElementById("avatar-header");
  const sidebar = document.getElementById("avatar-usuario");
  if (header) { header.textContent = texto; header.title = perfil.nome; }
  if (sidebar) { sidebar.textContent = texto; sidebar.title = perfil.nome; }
}

async function renderizarFavoritos(raiz) {
  const lista = document.getElementById("lista-favoritos");
  if (!lista || typeof getAll !== "function") return;

  const favoritos = await getAll("favoritos");
  if (favoritos.length === 0) {
    lista.innerHTML = '<li class="nav-item disabled" style="cursor:default">Nenhum favorito ainda</li>';
    return;
  }

  const linhas = await Promise.all(favoritos.map(async (fav) => {
    if (fav.tipo === "projeto") {
      const projeto = await getPorId("projetos", fav.refId);
      if (!projeto) return "";
      return `<a class="nav-item" href="${raiz}projetos/kanban.html?projeto=${projeto.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.9 6.3L21 9l-4.9 4.3L17.5 20 12 16.6 6.5 20l1.4-6.7L3 9l6.1-.7z"/></svg>
                ${projeto.nome}
              </a>`;
    }
    if (fav.tipo === "cliente") {
      const cliente = await getPorId("clientes", fav.refId);
      if (!cliente) return "";
      return `<a class="nav-item" href="${raiz}crm/index.html">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.9 6.3L21 9l-4.9 4.3L17.5 20 12 16.6 6.5 20l1.4-6.7L3 9l6.1-.7z"/></svg>
                ${cliente.nome}
              </a>`;
    }
    if (fav.tipo === "snippet") {
      const snippet = await getPorId("snippets", fav.refId);
      if (!snippet) return "";
      return `<a class="nav-item" href="${raiz}snippets/index.html">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.9 6.3L21 9l-4.9 4.3L17.5 20 12 16.6 6.5 20l1.4-6.7L3 9l6.1-.7z"/></svg>
                ${snippet.titulo}
              </a>`;
    }
    if (fav.tipo === "artigo") {
      const artigo = await getPorId("artigos", fav.refId);
      if (!artigo) return "";
      return `<a class="nav-item" href="${raiz}conhecimento/index.html">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.9 6.3L21 9l-4.9 4.3L17.5 20 12 16.6 6.5 20l1.4-6.7L3 9l6.1-.7z"/></svg>
                ${artigo.titulo}
              </a>`;
    }
    if (fav.tipo === "prompt") {
      const prompt = await getPorId("prompts", fav.refId);
      if (!prompt) return "";
      return `<a class="nav-item" href="${raiz}prompts/index.html">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.9 6.3L21 9l-4.9 4.3L17.5 20 12 16.6 6.5 20l1.4-6.7L3 9l6.1-.7z"/></svg>
                ${prompt.titulo}
              </a>`;
    }
    return "";
  }));

  lista.innerHTML = linhas.join("");
}

function ligarEventosSidebar() {
  document.getElementById("botao-tema")?.addEventListener("click", () => {
    const atual = document.documentElement.dataset.theme;
    aplicarTema(atual === "dark" ? "light" : "dark");
  });
  document.getElementById("botao-sair")?.addEventListener("click", sair);
  document.querySelectorAll("[data-grupo-toggle]").forEach((botao) => {
    botao.addEventListener("click", () => alternarGrupoMenu(botao.dataset.grupoToggle));
  });
}

async function rerenderizarSidebar(raiz) {
  document.getElementById("app-sidebar").innerHTML = sidebarHTML(raiz);
  destacarModuloAtivo();
  ligarEventosSidebar();
}

async function iniciarAppShell() {
  const raiz = typeof CTF_RAIZ !== "undefined" ? CTF_RAIZ : "./";

  // Página protegida: sem sessão válida, manda pro login e para tudo aqui.
  if (typeof exigirLogin === "function") {
    exigirLogin();
    if (!estaLogado()) return;
  }

  if (typeof semearDadosIniciais === "function") semearDadosIniciais();

  document.getElementById("app-header").innerHTML = headerHTML(raiz);
  document.getElementById("app-sidebar").innerHTML = sidebarHTML(raiz);

  aplicarTema(document.documentElement.dataset.theme || "dark");
  destacarModuloAtivo();
  await aplicarPerfilNosAvatares();
  await renderizarFavoritos(raiz);
  if (typeof onDadosMudarem === "function") {
    onDadosMudarem("favoritos", () => renderizarFavoritos(raiz));
    onDadosMudarem("perfil", aplicarPerfilNosAvatares);
    onDadosMudarem("menuGrupos", () => rerenderizarSidebar(raiz));
    onDadosMudarem("menuAtribuicoes", () => rerenderizarSidebar(raiz));
  }

  ligarEventosSidebar();

  document.getElementById("botao-menu-mobile")?.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-open");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement.id !== "busca-global") {
      e.preventDefault();
      document.getElementById("busca-global")?.focus();
    }
  });

  // Avisa a página (ex: crm/index.html) que o shell e os dados já estão prontos
  window.dispatchEvent(new CustomEvent("ctf:shell-pronto"));
}

document.addEventListener("DOMContentLoaded", iniciarAppShell);
