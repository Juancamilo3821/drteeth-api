const express = require('express');
const router = express.Router();
const treatmentController = require('../controllers/treatmentController');

// Ruta para obtener todos los tratamientos
router.get('/tratamientos', treatmentController.obtenerTratamientos);

module.exports = router;
