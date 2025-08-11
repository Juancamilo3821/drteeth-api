const mysql = require('mysql2');
require('dotenv').config();

// ===== Resolve vars (con fallbacks típicos de Railway) =====
const RESOLVED = {
  HOST: process.env.DB_HOST || process.env.MYSQLHOST || process.env.HOST_DE_BASE_DE_DATOS,
  USER: process.env.DB_USER || process.env.MYSQLUSER || process.env.USUARIO_BD,
  PASS: process.env.DB_PASS || process.env.MYSQLPASSWORD || process.env.CONTRASEÑA_MYSQL || process.env.CONTRASENA_MYSQL || process.env.CONTRASEÑA_DE_BASE_DE_DATOS,
  NAME: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.NOMBRE_DE_LA_BD,
  PORT: Number(process.env.DB_PORT || process.env.MYSQLPORT || process.env.PUERTO_BD || 3306),
};

(function ensureEnv () {
  const missing = [];
  if (!RESOLVED.HOST) missing.push('DB_HOST/MYSQLHOST');
  if (!RESOLVED.USER) missing.push('DB_USER/MYSQLUSER');
  if (!RESOLVED.PASS) missing.push('DB_PASS/MYSQLPASSWORD');
  if (!RESOLVED.NAME) missing.push('DB_NAME/MYSQLDATABASE');
  if (!RESOLVED.PORT) missing.push('DB_PORT/MYSQLPORT');

  console.log(`[DB] Config → host=${RESOLVED.HOST || 'undefined'} port=${RESOLVED.PORT} db=${RESOLVED.NAME || 'undefined'}`);
  if (missing.length) {
    console.error(`Faltan variables de DB: ${missing.join(', ')}. Abortando para evitar fallback a localhost (::1).`);
    process.exit(1);
  }
})();

const connectionConfig = {
  host: RESOLVED.HOST,
  user: RESOLVED.USER,
  password: RESOLVED.PASS,
  database: RESOLVED.NAME,
  port: RESOLVED.PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // ssl: {} // si tu proveedor requiere TLS y da error de certificado, descomenta
};

// Conexión única (solo para logs antiguos)
const single = mysql.createConnection({
  host: connectionConfig.host,
  user: connectionConfig.user,
  password: connectionConfig.password,
  database: connectionConfig.database,
  port: connectionConfig.port,
});

// Pool recomendado
const pool = mysql.createPool(connectionConfig);

// Ping
function ping(cb) {
  pool.query('SELECT 1', (err) => cb && cb(err));
}

/**
 * Compatibilidad: si en tus controladores hiciste
 *   const db = require('../config/db');
 *   db.query('...', ...)
 * esto hará que siga funcionando, pero usando el POOL.
 */
const compat = {
  query: (...args) => pool.query(...args),
  execute: (...args) => pool.execute(...args),
  promise: () => pool.promise(),
};

// Exporta TODO: compat + objetos reales
module.exports = Object.assign(compat, { db: single, pool, ping });
