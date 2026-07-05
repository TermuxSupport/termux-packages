const { Pool } = require("pg");

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.VERCEL_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

async function ensureTable() {
  const client = getPool();
  await client.query(`
    CREATE TABLE IF NOT EXISTS devices (
      id SERIAL PRIMARY KEY,
      device_id TEXT UNIQUE NOT NULL,
      package_version TEXT,
      python_version TEXT,
      platform TEXT,
      system TEXT,
      machine TEXT,
      hostname TEXT,
      first_seen TIMESTAMPTZ DEFAULT now(),
      last_seen TIMESTAMPTZ DEFAULT now(),
      checkin_count INTEGER DEFAULT 1,
      ip TEXT
    );
  `);
}

module.exports = { getPool, ensureTable };
