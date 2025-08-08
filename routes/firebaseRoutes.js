const express = require('express');
const router = express.Router();
const notifController = require('../controllers/firebaseController'); 

router.post('/enviar-notificacion', notifController.sendNotificationToUser);

module.exports = router;
