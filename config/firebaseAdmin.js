const admin = require('firebase-admin');
const serviceAccount = require('./drteeth-service-account.json'); // key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
