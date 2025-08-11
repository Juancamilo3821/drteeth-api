// config/firebaseAdmin.js
const admin = require('firebase-admin');

function init() {
  if (admin.apps.length) return admin; // evita doble init

  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 no está definida');
    }

    const json = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      'base64'
    ).toString('utf8');

    const sa = JSON.parse(json);

    // Logs mínimos de verificación (NO imprimas private_key)
    console.log('[FB] project_id:', sa.project_id);
    console.log('[FB] client_email:', sa.client_email);
    console.log('[FB] private_key_id:', sa.private_key_id);

    // Si viniera con \n escapados, normaliza:
    const privateKey = (sa.private_key || '').replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: sa.project_id,
        clientEmail: sa.client_email,
        privateKey,
      }),
    });

    console.log('✅ Firebase Admin inicializado');
  } catch (e) {
    console.error('❌ Error inicializando Firebase Admin:', e);
  }

  return admin;
}

module.exports = init();
