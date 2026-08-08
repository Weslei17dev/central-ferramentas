// db/migrate.js — roda schema.sql inteiro contra o DATABASE_URL do .env.
// Uso: npm run migrate (uma vez, ao configurar o banco pela primeira vez).
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Falta DATABASE_URL no .env — copie ".env.example" para ".env" e preencha.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Neon exige SSL
  });

  const caminhoSchema = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(caminhoSchema, "utf-8");

  console.log("Rodando schema.sql contra o banco...");
  await pool.query(sql);
  console.log("Schema aplicado com sucesso — todas as tabelas foram criadas.");

  await pool.end();
}

main().catch((erro) => {
  console.error("Erro ao rodar a migração:", erro.message);
  process.exit(1);
});
