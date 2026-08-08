// src/db.js — conexão única (pool) com o Postgres, reaproveitada por toda
// a API. Nenhuma rota deve criar sua própria conexão.
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon exige SSL
});

module.exports = pool;
