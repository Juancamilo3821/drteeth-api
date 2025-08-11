const express = require('express');
const router = express.Router();
const admin = require('../config/firebaseAdmin');
const { pool } = require('../config/db');

// Enviar por idUsuario o numeroDocumento
router.post('/_debug/test-push-user', async (req, res) => {
  const { userId, documento } = req.body;
  if (!userId && !documento) return res.status(400).json({ ok:false, error:'Falta userId o documento' });

  const sql = userId
    ? 'SELECT fcm_token FROM usuario WHERE idUsuario=?'
    : 'SELECT fcm_token FROM usuario WHERE numeroDocumento=?';
  pool.query(sql, [userId || documento], async (err, rows) => {
    if (err) return res.status(500).json({ ok:false, error:String(err) });
    if (!rows.length || !rows[0].fcm_token) return res.status(404).json({ ok:false, error:'Sin token' });

    try {
      const id = await admin.messaging().send({
        token: rows[0].fcm_token,
        notification: { title:'Test', body:'Hola desde backend' },
        android: { priority:'high' },
        apns: { payload: { aps: { sound:'default' } } },
      });
      res.json({ ok:true, id });
    } catch (e) {
      res.status(500).json({ ok:false, error: e?.errorInfo || String(e) });
    }
  });
});
module.exports = router;
