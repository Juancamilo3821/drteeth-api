const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authToken');

router.get('/', verifyToken, paymentController.obtenerPagos);

module.exports = router;
