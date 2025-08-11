// routes/testPush.js
const express = require('express');
const router = express.Router();
const admin = require('../config/firebaseAdmin');

router.post('/_debug/test-push', async (req, res) => {
  const { token } = req.body;
  try {
    const id = await admin.messaging().send({
      token,
      notification: { title: 'Test', body: 'Hola desde backend' },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
    res.json({ ok: true, id });
  } catch (e) {
    console.error('FCM error:', e?.errorInfo || e);
    res.status(500).json({ ok: false, error: e?.errorInfo || String(e) });
  }
});
module.exports = router;
