/* ==========================================================================
   PARTIALS.JS — header e sidebar como funções JS, não mais arquivos .html
   buscados por fetch(). Isso permite abrir qualquer página com duplo-clique
   (file://), sem precisar de servidor local.

   A partir desta versão, a sidebar é DIRIGIDA POR DADOS: os grupos e quais
   ferramentas pertencem a cada um vêm de `menuGrupos`/`menuAtribuicoes`
   (db.js) + `CATALOGO_FERRAMENTAS` (catalogo-menu.js). Para mudar a
   organização do menu, edite pela tela menu/index.html — não aqui.

   `raiz` é o caminho relativo até a pasta do projeto, definido por cada
   página em uma variável global ANTES de carregar este arquivo:
     - na raiz do projeto (index.html):        const CTF_RAIZ = "./";
     - um nível abaixo (crm/, projetos/):       const CTF_RAIZ = "../";

   Carregar depois de db.js e catalogo-menu.js, e antes de app-shell.js.
   ========================================================================== */

function navItemHTML(ferramenta, raiz) {
  return `
    <a class="nav-item" href="${raiz}${ferramenta.url}" data-nav="${ferramenta.chave}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${ferramenta.icone}</svg>
      ${ferramenta.nome}
    </a>`;
}

function grupoHTML(grupo, raiz, expandido) {
  const itens = ferramentasDoGrupo(grupo.id);
  if (itens.length === 0) return ""; // grupo sem nenhuma ferramenta não aparece
  return `
    <div class="sidebar-section">
      <button class="sidebar-grupo-header" data-grupo-toggle="${grupo.id}">
        <span>${grupo.nome}</span>
        <svg class="chevron ${expandido ? "aberto" : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>
      <div class="sidebar-grupo-itens ${expandido ? "" : "fechado"}" data-grupo-itens="${grupo.id}">
        ${itens.map((f) => navItemHTML(f, raiz)).join("")}
      </div>
    </div>`;
}

function sidebarHTML(raiz) {
  const estadoExpandido = JSON.parse(localStorage.getItem("ctf_menu_expandido") || "{}");
  const grupos = getAll("menuGrupos").sort((a, b) => a.ordem - b.ordem);
  const gruposHTML = grupos.map((g) => grupoHTML(g, raiz, estadoExpandido[g.id] !== false)).join("");

  const semGrupo = ferramentasSemGrupo();
  const semGrupoHTML = semGrupo.length ? `
    <div class="sidebar-section">
      <div class="sidebar-section-title">Outros</div>
      ${semGrupo.map((f) => navItemHTML(f, raiz)).join("")}
    </div>` : "";

  return `
  <nav class="sidebar">
    <div class="sidebar-brand">
      <span class="dot"></span>
      Central de Ferramentas
    </div>

    <div class="sidebar-section">
      <div class="sidebar-section-title">Favoritos</div>
      <ul id="lista-favoritos"></ul>
    </div>

    <div class="sidebar-section">
      <a class="nav-item" href="${raiz}index.html" data-nav="dashboard">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
        Dashboard
      </a>
    </div>

    ${gruposHTML}
    ${semGrupoHTML}

    <div class="sidebar-section">
      <a class="nav-item" href="${raiz}menu/index.html" data-nav="menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 12h16M4 18h10"/></svg>
        Configurar menu
      </a>
    </div>

    <div class="sidebar-footer">
      <a class="avatar" id="avatar-usuario" href="${raiz}perfil/index.html" title="Editar perfil" style="text-decoration:none;">VC</a>
      <button class="theme-toggle" id="botao-tema" title="Alternar tema" aria-label="Alternar tema claro/escuro">
        <svg id="icone-tema" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      </button>
      <button class="theme-toggle" id="botao-sair" title="Sair" aria-label="Sair da conta">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>
      </button>
    </div>
  </nav>`;
}

function headerHTML(raiz) {
  return `
  <header class="topbar">
    <button class="menu-toggle" id="botao-menu-mobile" aria-label="Abrir menu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    </button>

    <div class="search-box">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>
      <input type="text" id="busca-global" placeholder="Pesquisar projetos, clientes, tarefas..." />
      <span class="kbd">/</span>
    </div>

    <div class="topbar-right">
      <a class="avatar" id="avatar-header" href="${raiz}perfil/index.html" title="Editar perfil" style="text-decoration:none;">VC</a>
    </div>
  </header>`;
}
