const admin = require('firebase-admin');

function init() {
  if (admin.apps.length) return admin;

  try {
    let credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      const json = Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        'base64'
      ).toString('utf8');

      const sa = JSON.parse(json);

      console.log('[FB] project_id:', sa.project_id);
      console.log('[FB] client_email:', sa.client_email);

      credential = admin.credential.cert({
        projectId: sa.project_id,
        clientEmail: sa.client_email,
        privateKey: sa.private_key.replace(/\\n/g, '\n'), // por si vienen escapados
      });
    } else {
      // Fallback a archivo local (si lo tienes)
      const sa = require('./drteethapp-service.json');
      console.log('[FB] project_id:', sa.project_id);
      console.log('[FB] client_email:', sa.client_email);
      credential = admin.credential.cert(sa);
    }

    admin.initializeApp({ credential });
    console.log('Firebase Admin inicializado');
  } catch (e) {
    console.error('Error inicializando Firebase Admin:', e);
  }

  return admin;
}

module.exports = init();
