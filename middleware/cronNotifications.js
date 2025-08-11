// cronNotifications.js
const cron = require('node-cron');
const admin = require('../config/firebaseAdmin');
// Se mantiene tu import original; el cron usará el pool que le pasemos
const { db, pool } = require('../config/db');

/**
 * Exportamos una función para iniciar el cron.
 * Si no reciben un pool, usa el importado.
 */
function startCron(injectedPool) {
  const usePool = injectedPool || pool;

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

    // Usamos SIEMPRE el POOL
    usePool.query(query, async (err, results) => {
      if (err) {
        console.error(' Error en la consulta (cron):', err);
        return; // no rompas el cron
      }

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
        const horasAntes = (fechaCita - ahora) / (1000 * 60 * 60);

        let titulo = '';
        let cuerpo = '';
        let updateQuery = '';
        let notificacionTipo = '';

        if (horasAntes >= 2.5 && horasAntes <= 3.5 && notificado_3h === 0) {
          titulo = 'Recordatorio de cita';
          cuerpo = `Tienes una cita en 3 horas.`;
          updateQuery = `UPDATE citas SET notificado_3h = 1 WHERE idCita = ?`;
          notificacionTipo = '3h';
        } else if (horasAntes >= 23.5 && horasAntes <= 24.5 && notificado_24h === 0) {
          titulo = 'Recordatorio de cita';
          cuerpo = `Tienes una cita mañana a las ${fechaCita.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
          updateQuery = `UPDATE citas SET notificado_24h = 1 WHERE idCita = ?`;
          notificacionTipo = '24h';
        } else if (recordatorio_activado_at) {
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

          if (updateQuery) {
            usePool.query(updateQuery, [idCita], (err2) => {
              if (err2) {
                console.error(` Error actualizando notificado_${notificacionTipo} para cita ${idCita}:`, err2);
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
}

module.exports = { startCron };
