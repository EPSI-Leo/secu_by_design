import express from 'express';
import mariadb from 'mariadb';
import vault from 'node-vault';

const port = process.env.PORT || 3000;
const VAULT_PATH = 'kv/data/db';         // chemin où l’on stocke login/mdp

const vaultClient = vault({
  apiVersion: 'v1',
  endpoint:   process.env.VAULT_ADDR,
  token:      process.env.VAULT_TOKEN
});

const app = express();

async function getDbPool() {
  // Récupère le secret à chaque appel → si le mot de passe change, la
  // prochaine connexion utilisera la nouvelle valeur sans changer le code
  const secret = await vaultClient.read(VAULT_PATH);
  const { username, password } = secret.data.data;

  return mariadb.createPool({
    host: 'mariadb',
    user: username,
    password,
    database: 'testvault',
    connectionLimit: 5
  });
}

app.get('/', async (_req, res) => {
  let pool, conn;
  try {
    pool = await getDbPool();
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM livre');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
    if (pool) pool.end();
  }
});

app.listen(port, () =>
  console.log(`→ http://localhost:${port} (CTRL-C pour arrêter)`)
);
