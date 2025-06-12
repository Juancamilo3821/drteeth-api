const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/citas', appointmentController.obtenerCitas);

module.exports = router;
