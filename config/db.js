const mysql = require('mysql2');
require('dotenv').config();

// ---- CONFIG COMPARTIDA (lee tus .env / variables de Railway)
const connectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // Si tu DB exige SSL y tu CA no está disponible, puedes usar:
  // ssl: {}
};

// ---- Conexión única (SE MANTIENE por compatibilidad con tu código)
const db = mysql.createConnection({
  host: connectionConfig.host,
  user: connectionConfig.user,
  password: connectionConfig.password,
  database: connectionConfig.database,
  port: connectionConfig.port
});

// ---- NUEVO: Pool recomendado (auto-reintentos/gestión de conexiones)
const pool = mysql.createPool(connectionConfig);

// ---- Utilidad para verificar disponibilidad de la DB
function ping(cb) {
  pool.query('SELECT 1', (err) => cb && cb(err));
}

module.exports = { db, pool, ping };
