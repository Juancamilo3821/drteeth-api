const express = require('express');
const router = express.Router();
const carruselController = require('../controllers/carruselController');
const { verifyToken } = require('../middleware/authToken');

router.get('/carrusel', verifyToken, carruselController.obtenerImagenes);

module.exports = router;