const admin = require('../config/firebaseAdmin');
const { pool } = require('../config/db');
const db = pool; 

exports.sendNotificationToUser = (req, res) => {
  const { numeroDocumento, title, body } = req.body;

  const query = 'SELECT fcm_token FROM usuario WHERE numeroDocumento = ?';

  db.query(query, [numeroDocumento], (err, results) => {
    if (err) {
      console.error('Error al consultar el FCM token:', err);
      return res.status(500).json({ error: 'Error de base de datos' });
    }

    if (results.length === 0 || !results[0].fcm_token) {
      return res.status(404).json({ error: 'Token FCM no encontrado para este usuario' });
    }

    const fcmToken = results[0].fcm_token;

    const message = {
      token: fcmToken,
      notification: {
        title,
        body
      },
      android: {
        priority: 'high'
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      }
    };

    admin.messaging().send(message)
      .then(response => {
        console.log('Notificación enviada:', response);
        res.status(200).json({ message: 'Notificación enviada con éxito' });
      })
      .catch(error => {
        console.error('Error al enviar notificación:', error);
        res.status(500).json({ error: 'Error al enviar notificación' });
      });
  });
};
