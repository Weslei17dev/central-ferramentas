// src/index.js — ponto de entrada. `npm start` roda este arquivo.
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const rotasAuth = require("./routes/auth");
const rotasPerfil = require("./routes/perfil");
const rotasPortfolio = require("./routes/portfolio");
const rotasGenerico = require("./routes/generico");

const app = express();
app.use(express.json());

// Rede de segurança: se algum código em algum lugar esquecer um try/catch
// numa Promise, isso evita que o processo inteiro morra (como aconteceu
// antes desta linha existir — ver histórico do projeto).
process.on("unhandledRejection", (erro) => {
  console.error("Erro não tratado (unhandledRejection):", erro);
});

const origensPermitidas = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // "origin" vem vazio em ferramentas tipo curl/Postman — permite.
      if (!origin || origensPermitidas.includes(origin)) return callback(null, true);
      callback(new Error(`Origem não permitida pela API: ${origin}`));
    },
  })
);

// Usado para conferir rapidamente se a API está no ar (ver docs/MIGRACAO-BACKEND.md).
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", rotasAuth);
app.use("/api/perfil", rotasPerfil);
app.use("/api/portfolio", rotasPortfolio);
app.use("/api", rotasGenerico);

app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada." }));

// Handler de erro do Express — pega qualquer erro que uma rota passar pra
// frente com next(erro), ou que escape de um try/catch mal colocado.
app.use((erro, req, res, next) => {
  console.error(erro);
  res.status(500).json({ erro: "Erro interno no servidor." });
});

const porta = process.env.PORT || 3000;
app.listen(porta, () => console.log(`API da Central de Ferramentas rodando na porta ${porta}`));
