const express = require('express');
const router = express.Router();
const treatmentController = require('../controllers/treatmentController');
const { verifyToken } = require('../middleware/authToken');

// Ruta para obtener todos los tratamientos
router.get('/tratamientos', verifyToken, treatmentController.obtenerTratamientos);

module.exports = router;
