const express = require('express');
const router = express.Router();
const disabilitieController = require('../controllers/disabilitieController');

router.get('/obtenerIncapacidades', disabilitieController.obtenerIncapacidades);

module.exports = router;
