const express = require('express');
const router = express.Router();
const disabilitieController = require('../controllers/disabilitieController');
const { verifyToken } = require('../middleware/authToken');

router.get('/obtenerIncapacidades', verifyToken, disabilitieController.obtenerIncapacidades);

module.exports = router;
