// src/auth-middleware.js — verifica o JWT do cabeçalho "Authorization:
// Bearer <token>". Se válido, põe req.usuario = { id, nome, email } e
// segue; se não, responde 401 e para ali.
const jwt = require("jsonwebtoken");

function exigirLogin(req, res, next) {
  const cabecalho = req.headers.authorization || "";
  const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : null;

  if (!token) {
    return res.status(401).json({ erro: "Faça login para continuar." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: payload.sub, nome: payload.nome, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ erro: "Sessão inválida ou expirada. Faça login novamente." });
  }
}

module.exports = exigirLogin;
