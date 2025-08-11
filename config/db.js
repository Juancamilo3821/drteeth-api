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

// Evita que caiga a ::1 si falta algo
(function ensureEnv () {
  const missing = [];
  if (!RESOLVED.HOST) missing.push('DB_HOST/MYSQLHOST');
  if (!RESOLVED.USER) missing.push('DB_USER/MYSQLUSER');
  if (!RESOLVED.PASS) missing.push('DB_PASS/MYSQLPASSWORD');
  if (!RESOLVED.NAME) missing.push('DB_NAME/MYSQLDATABASE');
  if (!RESOLVED.PORT) missing.push('DB_PORT/MYSQLPORT');

  console.log(`[DB] Config → host=${RESOLVED.HOST || 'undefined'} port=${RESOLVED.PORT} db=${RESOLVED.NAME || 'undefined'}`);

  if (missing.length) {
    console.error(`❌ Faltan variables de DB: ${missing.join(', ')}. Abortando para evitar fallback a localhost (::1).`);
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
  // Si tu proveedor exige TLS y da error de certificado, descomenta:
  // ssl: {}
};

// ---- Mantengo tu “conexión única” (para compatibilidad con tu código)
const db = mysql.createConnection({
  host: connectionConfig.host,
  user: connectionConfig.user,
  password: connectionConfig.password,
  database: connectionConfig.database,
  port: connectionConfig.port,
});

// ---- NUEVO: pool recomendado
const pool = mysql.createPool(connectionConfig);

// ---- Ping para comprobar disponibilidad
function ping(cb) {
  pool.query('SELECT 1', (err) => cb && cb(err));
}

module.exports = { db, pool, ping };
