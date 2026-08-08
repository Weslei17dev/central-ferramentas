// src/routes/portfolio.js — só existe UMA linha nessa tabela (id = true).
// Diferente de tudo o mais na API: a LEITURA é pública, de propósito — a
// página portfolio/index.html é pra ser compartilhada com qualquer pessoa,
// sem exigir login (é a página pública da plataforma).
const express = require("express");
const pool = require("../db");
const exigirLogin = require("../auth-middleware");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM portfolio WHERE id = true");
    res.json(rows[0] || null);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

router.put("/", exigirLogin, async (req, res) => {
  const { nome, cargo, bio, tecnologias, links, experiencias, certificados, projetosDestaque } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO portfolio (id, nome, cargo, bio, tecnologias, links, experiencias, certificados, projetos_destaque)
       VALUES (true, $1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         nome = $1, cargo = $2, bio = $3, tecnologias = $4, links = $5,
         experiencias = $6, certificados = $7, projetos_destaque = $8
       RETURNING *`,
      [
        nome, cargo, bio,
        tecnologias || [],
        JSON.stringify(links || {}),
        JSON.stringify(experiencias || []),
        JSON.stringify(certificados || []),
        JSON.stringify(projetosDestaque || []),
      ]
    );
    res.json(rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

module.exports = router;
