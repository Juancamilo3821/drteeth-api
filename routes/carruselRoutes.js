const express = require('express');
const router = express.Router();
const carruselController = require('../controllers/carruselController');

router.get('/carrusel', carruselController.obtenerImagenes);

module.exports = router;