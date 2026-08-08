// src/routes/generico.js — em vez de escrever uma rota por tabela (30
// tabelas!), uma rota só ("/api/:tabela") atende todas, porque o front-end
// (assets/js/db.js) já foi desenhado em cima de 5 operações genéricas:
// getAll, getPorId, inserir, atualizar, remover. Isso é o espelho, do lado
// do servidor, dessa mesma ideia.
//
// "usuarios" nunca passa por aqui (tem senha_hash — rota própria em auth.js).
// "perfis" e "portfolio" também têm rota própria (regras diferentes: uma é
// por usuário, a outra é pública para leitura). Ver src/routes/perfil.js e
// src/routes/portfolio.js.
const express = require("express");
const pool = require("../db");
const exigirLogin = require("../auth-middleware");

const router = express.Router();

const TABELAS_PERMITIDAS = new Set([
  "clientes", "produtos", "oportunidades", "tarefas_crm", "equipe",
  "projetos", "kanban_colunas", "tarefas",
  "eventos", "lancamentos", "itens_estoque", "movimentos_estoque",
  "arquivos", "tickets", "ticket_comentarios", "ticket_tempos",
  "categorias", "snippets", "artigos", "prompts",
  "metricas", "relatorios", "layouts",
  "logs", "menu_grupos", "menu_atribuicoes",
]);

// Nome de coluna só pode ser um identificador "normal" (snake_case) — isso
// impede que alguém injete SQL através de uma chave maliciosa no corpo da
// requisição (ex: {"x\"; DROP TABLE clientes; --": 1}).
const NOME_COLUNA_VALIDO = /^[a-z_][a-z0-9_]*$/;

function validarTabela(req, res, next) {
  if (!TABELAS_PERMITIDAS.has(req.params.tabela)) {
    return res.status(404).json({ erro: `Tabela "${req.params.tabela}" não existe ou não é acessível pela API.` });
  }
  next();
}

function validarColunas(corpo) {
  return Object.keys(corpo).every((chave) => NOME_COLUNA_VALIDO.test(chave));
}

router.use("/:tabela", exigirLogin, validarTabela);

router.get("/:tabela", async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM ${req.params.tabela}`);
    res.json(rows);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

router.get("/:tabela/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM ${req.params.tabela} WHERE id = $1`, [req.params.id]);
    res.json(rows[0] || null);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

router.post("/:tabela", async (req, res) => {
  const corpo = { ...req.body };
  delete corpo.id; // id é sempre gerado pelo banco (gen_random_uuid())
  if (Object.keys(corpo).length === 0) return res.status(400).json({ erro: "Corpo vazio." });
  if (!validarColunas(corpo)) return res.status(400).json({ erro: "Nome de coluna inválido no corpo da requisição." });

  const colunas = Object.keys(corpo);
  const valores = Object.values(corpo);
  const listaColunas = colunas.map((c) => `"${c}"`).join(", ");
  const marcadores = colunas.map((_, i) => `$${i + 1}`).join(", ");

  try {
    const { rows } = await pool.query(
      `INSERT INTO ${req.params.tabela} (${listaColunas}) VALUES (${marcadores}) RETURNING *`,
      valores
    );
    res.status(201).json(rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

router.patch("/:tabela/:id", async (req, res) => {
  const corpo = { ...req.body };
  delete corpo.id;
  if (Object.keys(corpo).length === 0) return res.status(400).json({ erro: "Corpo vazio." });
  if (!validarColunas(corpo)) return res.status(400).json({ erro: "Nome de coluna inválido no corpo da requisição." });

  const colunas = Object.keys(corpo);
  const valores = Object.values(corpo);
  const atribuicoes = colunas.map((c, i) => `"${c}" = $${i + 1}`).join(", ");

  try {
    const { rows } = await pool.query(
      `UPDATE ${req.params.tabela} SET ${atribuicoes} WHERE id = $${colunas.length + 1} RETURNING *`,
      [...valores, req.params.id]
    );
    res.json(rows[0] || null);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

router.delete("/:tabela/:id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM ${req.params.tabela} WHERE id = $1`, [req.params.id]);
    res.status(204).end();
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

module.exports = router;
