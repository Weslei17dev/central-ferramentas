// src/routes/auth.js — cadastro e login (e-mail/senha), emissão de JWT.
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const exigirLogin = require("../auth-middleware");

const router = express.Router();

function emitirToken(usuario) {
  return jwt.sign(
    { sub: usuario.id, nome: usuario.nome, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

router.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha || senha.length < 8) {
    return res.status(400).json({ erro: "Preencha nome, e-mail e uma senha com 8 ou mais caracteres." });
  }

  try {
    const existente = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (existente.rows.length > 0) {
      return res.status(409).json({ erro: "Já existe uma conta com esse e-mail." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const { rows } = await pool.query(
      "INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email",
      [nome, email, senhaHash]
    );
    const usuario = rows[0];
    res.status(201).json({ token: emitirToken(usuario), usuario });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: "Preencha e-mail e senha." });
  }

  try {
    const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    const usuario = rows[0];
    const senhaConfere = usuario ? await bcrypt.compare(senha, usuario.senha_hash) : false;

    if (!senhaConfere) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos." });
    }

    const dadosPublicos = { id: usuario.id, nome: usuario.nome, email: usuario.email };
    res.json({ token: emitirToken(dadosPublicos), usuario: dadosPublicos });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

router.get("/eu", exigirLogin, (req, res) => {
  res.json({ usuario: req.usuario });
});

module.exports = router;
