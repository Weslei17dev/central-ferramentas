// src/routes/perfil.js — cada usuário tem UMA linha (chave = usuario_id),
// por isso não é uma tabela genérica: "GET /api/perfil" sempre devolve o
// perfil de QUEM ESTÁ LOGADO, nunca de outra pessoa.
const express = require("express");
const pool = require("../db");
const exigirLogin = require("../auth-middleware");

const router = express.Router();
router.use(exigirLogin);

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM perfis WHERE usuario_id = $1", [req.usuario.id]);
    res.json(rows[0] || { nome: req.usuario.nome, cargo: "" });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

router.put("/", async (req, res) => {
  const { nome, cargo } = req.body;
  if (!nome) return res.status(400).json({ erro: "Nome é obrigatório." });
  try {
    const { rows } = await pool.query(
      `INSERT INTO perfis (usuario_id, nome, cargo) VALUES ($1, $2, $3)
       ON CONFLICT (usuario_id) DO UPDATE SET nome = $2, cargo = $3
       RETURNING *`,
      [req.usuario.id, nome, cargo || null]
    );
    res.json(rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

module.exports = router;
