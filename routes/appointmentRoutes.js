const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken } = require('../middleware/authToken');

router.get('/citas', verifyToken, appointmentController.obtenerCitas);
router.post('/citas/:id/recordatorio', verifyToken, appointmentController.actualizarRecordatorio);


module.exports = router;
