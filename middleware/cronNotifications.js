// cronNotifications.js
const cron = require('node-cron');
const db = require('../config/db');
const admin = require('../config/firebaseAdmin');

// Ejecutar cada minuto (pruebas)
cron.schedule('* * * * *', async () => {
  const now = new Date();

  const query = `
    SELECT 
      c.idCita,
      u.numeroDocumento, 
      u.fcm_token, 
      c.fecha_hora, 
      c.recordatorio_activado, 
      c.recordatorio_activado_at,
      c.notificado_3h,
      c.notificado_24h
    FROM citas c
    JOIN usuario u ON c.Usuario_idUsuario = u.idUsuario
    WHERE 
      u.fcm_token IS NOT NULL 
      AND c.recordatorio_activado = 1
  `;

  db.query(query, async (err, results) => {
    if (err) return console.error(' Error en la consulta:', err);

    for (const cita of results) {
      const {
        idCita,
        numeroDocumento,
        fcm_token,
        fecha_hora,
        recordatorio_activado_at,
        notificado_3h,
        notificado_24h
      } = cita;

      const fechaCita = new Date(fecha_hora);
      const ahora = new Date();
      const horasAntes = (fechaCita - ahora) / (1000 * 60 * 60); // a horas

      let titulo = '';
      let cuerpo = '';
      let updateQuery = '';
      let notificacionTipo = '';

      // Notificación de 3 horas
      if (horasAntes >= 2.5 && horasAntes <= 3.5 && notificado_3h === 0) {
        titulo = 'Recordatorio de cita';
        cuerpo = `Tienes una cita en 3 horas.`;
        updateQuery = `UPDATE citas SET notificado_3h = 1 WHERE idCita = ?`;
        notificacionTipo = '3h';
      }

      // Notificación de 24 horas
      else if (horasAntes >= 23.5 && horasAntes <= 24.5 && notificado_24h === 0) {
        titulo = 'Recordatorio de cita';
        cuerpo = `Tienes una cita mañana a las ${fechaCita.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
        updateQuery = `UPDATE citas SET notificado_24h = 1 WHERE idCita = ?`;
        notificacionTipo = '24h';
      }

      // Notificación de prueba (3 minutos después de activar)
      else if (recordatorio_activado_at) {
        const activado = new Date(recordatorio_activado_at);
        const minutosDesdeActivacion = (ahora - activado) / (1000 * 60);
        if (minutosDesdeActivacion >= 3 && minutosDesdeActivacion < 4) {
          titulo = 'Notificaciónes Activadas';
          cuerpo = 'Recibirás tus recordatorios 24h y 3h antes de tu cita.';
        }
      }

      if (!titulo) continue;

      const message = {
        token: fcm_token,
        notification: { title: titulo, body: cuerpo },
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } }
      };

      try {
        await admin.messaging().send(message);
        console.log(`Notificación enviada a ${numeroDocumento}: ${titulo}`);

        // Si es una notificación real, actualiza la tabla
        if (updateQuery) {
          db.query(updateQuery, [idCita], (err) => {
            if (err) {
              console.error(` Error actualizando notificado_${notificacionTipo} para cita ${idCita}:`, err);
            } else {
              console.log(`Marcado como notificado_${notificacionTipo} para cita ${idCita}`);
            }
          });
        }

      } catch (error) {
        console.error(`Error enviando notificación a ${numeroDocumento}:`, error);
      }
    }
  });
});
