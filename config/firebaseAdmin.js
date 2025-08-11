const admin = require('firebase-admin');

function init() {
  if (admin.apps.length) return admin;

  try {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!b64) throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 no está definida');

    const json = Buffer.from(b64.trim(), 'base64').toString('utf8');
    const sa = JSON.parse(json);

    // normaliza saltos
    let pk = (sa.private_key || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (pk.includes('\\n')) pk = pk.replace(/\\n/g, '\n');

    console.log('[FB] project_id:', sa.project_id);
    console.log('[FB] client_email:', sa.client_email);
    console.log('[FB] private_key_id:', sa.private_key_id);

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: sa.project_id,
        clientEmail: sa.client_email,
        privateKey: pk,
      }),
    });

    console.log('Firebase Admin inicializado');
  } catch (e) {
    console.error('Error inicializando Firebase Admin:', e);
  }

  return admin;
}
module.exports = init();
