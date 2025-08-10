const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  console.log(`[PING] Solicitud recibida a las ${new Date().toISOString()}`);
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

module.exports = router;
