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
      ip TEXT,
      is_termux BOOLEAN DEFAULT false,
      device_brand TEXT,
      device_model TEXT,
      device_manufacturer TEXT,
      android_version TEXT,
      termux_version TEXT
    );
  `);
  await client.query(`ALTER TABLE devices ADD COLUMN IF NOT EXISTS is_termux BOOLEAN DEFAULT false;`);
  await client.query(`ALTER TABLE devices ADD COLUMN IF NOT EXISTS device_brand TEXT;`);
  await client.query(`ALTER TABLE devices ADD COLUMN IF NOT EXISTS device_model TEXT;`);
  await client.query(`ALTER TABLE devices ADD COLUMN IF NOT EXISTS device_manufacturer TEXT;`);
  await client.query(`ALTER TABLE devices ADD COLUMN IF NOT EXISTS android_version TEXT;`);
  await client.query(`ALTER TABLE devices ADD COLUMN IF NOT EXISTS termux_version TEXT;`);
}

module.exports = { getPool, ensureTable };
