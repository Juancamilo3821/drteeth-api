// config/firebaseAdmin.js
const admin = require('firebase-admin');

function init() {
  if (admin.apps.length) return admin; // evita doble init

  try {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!b64) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 no está definida');
    }

    const json = Buffer.from(b64, 'base64').toString('utf8');
    const sa = JSON.parse(json);

    // Logs mínimos de verificación (NO imprimas la private_key)
    console.log('[FB] project_id:', sa.project_id);
    console.log('[FB] client_email:', sa.client_email);
    console.log('[FB] private_key_id:', sa.private_key_id);

    // Normaliza saltos si vinieran escapados
    const privateKey = (sa.private_key || '').includes('\\n')
      ? sa.private_key.replace(/\\n/g, '\n')
      : sa.private_key;

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: sa.project_id,
        clientEmail: sa.client_email,
        privateKey,
      }),
    });

    console.log('Firebase Admin inicializado');
  } catch (e) {
    console.error('Error inicializando Firebase Admin:', e);
  }

  return admin;
}

module.exports = init();
