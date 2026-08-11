/* ==========================================================================
   UTILS.JS — pequenas funções reaproveitadas por qualquer módulo.
   Carregar antes de db.js e antes do JS específico da página.
   ========================================================================== */

/** Gera um ID único (com fallback para navegadores sem crypto.randomUUID). */
function gerarId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

/** Formata uma data ISO para o padrão pt-BR (ex: 21/07/2026). */
function formatarData(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleDateString("pt-BR");
}

/** Retorna as iniciais de um nome (ex: "Nexa Varejo" -> "NV"). */
function iniciais(nome) {
  if (!nome) return "?";
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

/**
 * Paleta fixa de cores para identificar clientes visualmente (o "fio
 * condutor" entre módulos). A cor é escolhida por posição, não por hash,
 * para ficar previsível: o primeiro cliente cadastrado sempre pega a
 * primeira cor da lista.
 */
const PALETA_CLIENTES = [
  "#E5484D", // vermelho (marca) — reservado ao 1º cliente
  "#D9962B", // âmbar
  "#3FB27F", // verde
  "#3B82F6", // azul
  "#A855F7", // violeta
  "#EC4899", // rosa
  "#14B8A6", // teal
  "#F59E0B", // laranja
];

function corParaIndice(indice) {
  return PALETA_CLIENTES[indice % PALETA_CLIENTES.length];
}

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Formata bytes em KB/MB legíveis (ex: 2500000 -> "2.4 MB"). */
function formatarTamanho(bytes) {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Renderiza uma versão simplificada de markdown (títulos #/##/###, listas com
 * "- ", **negrito** e *itálico*). Não é um parser completo, só o suficiente
 * para dar uma cara de "documento" na Base de Conhecimento sem precisar de
 * uma biblioteca externa.
 */
function renderizarMarkdownLite(textoBruto) {
  const linhas = escaparHTML(textoBruto).split("\n");
  let html = "";
  let dentroDeLista = false;

  const fecharLista = () => { if (dentroDeLista) { html += "</ul>"; dentroDeLista = false; } };
  const inline = (t) => t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");

  linhas.forEach((linha) => {
    if (linha.startsWith("### ")) { fecharLista(); html += `<h4>${inline(linha.slice(4))}</h4>`; }
    else if (linha.startsWith("## ")) { fecharLista(); html += `<h3>${inline(linha.slice(3))}</h3>`; }
    else if (linha.startsWith("# ")) { fecharLista(); html += `<h2>${inline(linha.slice(2))}</h2>`; }
    else if (linha.startsWith("- ")) { if (!dentroDeLista) { html += "<ul>"; dentroDeLista = true; } html += `<li>${inline(linha.slice(2))}</li>`; }
    else if (linha.trim() === "") { fecharLista(); }
    else { fecharLista(); html += `<p>${inline(linha)}</p>`; }
  });
  fecharLista();
  return html;
}

/** Escapa HTML para exibir código/texto de usuário com segurança (ex: em blocos <pre>). */
function escaparHTML(texto) {
  const mapa = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(texto).replace(/[&<>"']/g, (c) => mapa[c]);
}

/** Horas de SLA (prazo de atendimento) por prioridade, usado pelo módulo Tickets. */
const SLA_HORAS = { urgente: 4, alta: 8, media: 24, baixa: 48 };

/** Retorna a data-limite do SLA a partir da criação do ticket e da prioridade. */
function calcularPrazoSLA(criadoEm, prioridade) {
  const horas = SLA_HORAS[prioridade] || 24;
  return new Date(new Date(criadoEm).getTime() + horas * 3600 * 1000);
}

/** Formata um número como moeda brasileira (ex: 1200 -> "R$ 1.200,00"). */
function formatarMoeda(valor) {
  return (Number(valor) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Debounce simples, útil para caixas de busca. */
function debounce(fn, delay = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
