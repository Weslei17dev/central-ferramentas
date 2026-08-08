// db/seed.js — cria o primeiro usuário (você), usando ADMIN_NOME/ADMIN_EMAIL/
// ADMIN_SENHA do .env. Sem isso, ninguém consegue logar na primeira vez
// (a tela de cadastro também funciona, este script é só um atalho).
// Uso: npm run seed
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

async function main() {
  const { ADMIN_NOME, ADMIN_EMAIL, ADMIN_SENHA, DATABASE_URL } = process.env;

  if (!DATABASE_URL) {
    console.error('Falta DATABASE_URL no .env — copie ".env.example" para ".env" e preencha.');
    process.exit(1);
  }
  if (!ADMIN_NOME || !ADMIN_EMAIL || !ADMIN_SENHA) {
    console.error("Preencha ADMIN_NOME, ADMIN_EMAIL e ADMIN_SENHA no .env antes de rodar o seed.");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const existente = await pool.query("SELECT id FROM usuarios WHERE email = $1", [ADMIN_EMAIL]);
  if (existente.rows.length > 0) {
    console.log(`Já existe um usuário com o e-mail ${ADMIN_EMAIL} — nada a fazer.`);
  } else {
    const senhaHash = await bcrypt.hash(ADMIN_SENHA, 10);
    await pool.query(
      "INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3)",
      [ADMIN_NOME, ADMIN_EMAIL, senhaHash]
    );
    console.log(`Usuário "${ADMIN_NOME}" (${ADMIN_EMAIL}) criado. Já pode fazer login com essa senha.`);
  }

  await pool.end();
}

main().catch((erro) => {
  console.error("Erro ao rodar o seed:", erro.message);
  process.exit(1);
});
