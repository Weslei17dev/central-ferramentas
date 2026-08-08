/* ==========================================================================
   EVENTS.JS — barramento de eventos simples entre módulos.
   db.js dispara "ctf:change" sempre que uma tabela muda; qualquer página
   pode escutar isso para atualizar a tela sem precisar de framework.
   Carregar depois de utils.js e antes de db.js.
   ========================================================================== */

const CTF_EVENTO = "ctf:change";

/** Escuta mudanças de dados. Ex: onDadosMudarem('projetos', () => recarregarLista()) */
function onDadosMudarem(tabela, callback) {
  window.addEventListener(CTF_EVENTO, (e) => {
    if (!tabela || e.detail?.tabela === tabela) callback(e.detail);
  });
}

/** Dispara manualmente um evento de mudança (db.js já faz isso sozinho). */
function avisarMudanca(tabela, extra = {}) {
  window.dispatchEvent(new CustomEvent(CTF_EVENTO, { detail: { tabela, ...extra } }));
}

/**
 * Sincroniza abas diferentes do navegador: quando o localStorage muda em
 * outra aba, o evento nativo "storage" dispara aqui e replicamos como
 * "ctf:change" local, para não precisar de dois sistemas de escuta.
 */
window.addEventListener("storage", (e) => {
  if (e.key && e.key.startsWith("ctf_")) {
    avisarMudanca(e.key.replace("ctf_", ""), { origemOutraAba: true });
  }
});
