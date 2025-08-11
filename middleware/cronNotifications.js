// cronNotifications.js
const cron = require('node-cron');
const admin = require('../config/firebaseAdmin');
const { pool } = require('../config/db'); // usamos el pool (injected o el default)

/**
 * Inicia el cron que revisa citas y envía notificaciones.
 * Si nos inyectan un pool externo lo usamos; si no, usamos el de config.
 */
function startCron(injectedPool) {
  const usePool = injectedPool || pool;

  // Corre cada minuto en UTC (evita líos de zona horaria del contenedor)
  cron.schedule(
    '* * * * *',
    async () => {
      const query = `
        SELECT
          c.idCita,
          u.numeroDocumento,
          u.fcm_token,
          c.fecha_hora,                           -- almacenada en UTC
          c.recordatorio_activado,
          c.recordatorio_activado_at,
          c.notificado_3h,
          c.notificado_24h,

          -- diferencia en minutos entre ahora UTC y la cita
          TIMESTAMPDIFF(MINUTE, UTC_TIMESTAMP(), c.fecha_hora) AS diff_min,

          -- decide qué notificación toca enviar
          CASE
            WHEN TIMESTAMPDIFF(MINUTE, UTC_TIMESTAMP(), c.fecha_hora)
                 BETWEEN 174 AND 186 AND c.notificado_3h = 0 THEN '3h'
            WHEN TIMESTAMPDIFF(MINUTE, UTC_TIMESTAMP(), c.fecha_hora)
                 BETWEEN 1434 AND 1446 AND c.notificado_24h = 0 THEN '24h'
            ELSE NULL
          END AS to_send,

          -- minutos desde que el usuario activó los recordatorios
          TIMESTAMPDIFF(
            MINUTE,
            c.recordatorio_activado_at,
            UTC_TIMESTAMP()
          ) AS mins_since_activation,

          -- hora local Bogotá para mostrar en el texto
          DATE_FORMAT(
            CONVERT_TZ(c.fecha_hora, '+00:00', 'America/Bogota'),
            '%H:%i'
          ) AS hora_local_bo
        FROM citas c
        JOIN usuario u ON u.idUsuario = c.Usuario_idUsuario
        WHERE
          u.fcm_token IS NOT NULL
          AND u.fcm_token <> ''
          AND c.recordatorio_activado = 1
      `;

      usePool.query(query, async (err, rows) => {
        if (err) {
          console.error('[cron] SQL error:', err);
          return;
        }

        for (const r of rows) {
          try {
            let titulo = '';
            let cuerpo = '';
            let colUpdate = null;

            // Log de diagnóstico
            // console.log(`[cron] cita=${r.idCita} diff=${r.diff_min}min to=${r.to_send} minsAct=${r.mins_since_activation}`);

            if (r.to_send === '3h') {
              titulo = 'Recordatorio de cita';
              cuerpo = 'Tienes una cita en 3 horas.';
              colUpdate = 'notificado_3h';
            } else if (r.to_send === '24h') {
              titulo = 'Recordatorio de cita';
              cuerpo = `Tienes una cita mañana a las ${r.hora_local_bo}.`;
              colUpdate = 'notificado_24h';
            } else if (
              r.mins_since_activation !== null &&
              r.mins_since_activation >= 3 &&
              r.mins_since_activation < 4
            ) {
              // Mensaje único ~3 minutos después de activar
              titulo = 'Notificaciones activadas';
              cuerpo = 'Recibirás tus recordatorios 24h y 3h antes de tu cita.';
              // sin update de flags (no hay columna para esto)
            }

            if (!titulo) continue; // nada que enviar

            await admin.messaging().send({
              token: r.fcm_token,
              notification: { title: titulo, body: cuerpo },
              android: { priority: 'high' },
              apns: { payload: { aps: { sound: 'default' } } }
            });

            console.log(`[cron] push a ${r.numeroDocumento} (cita=${r.idCita}) → ${titulo}`);

            if (colUpdate) {
              usePool.query(
                `UPDATE citas SET ${colUpdate} = 1 WHERE idCita = ?`,
                [r.idCita],
                (uerr) => {
                  if (uerr) {
                    console.error(`[cron] ❌ update ${colUpdate} cita=${r.idCita}:`, uerr);
                  } else {
                    console.log(`[cron] marcado ${colUpdate}=1 cita=${r.idCita}`);
                  }
                }
              );
            }
          } catch (e) {
            console.error(`[cron] FCM err cita=${r.idCita}:`, e?.errorInfo || e);
          }
          // dentro del for del cron:
          console.log(`[cron] D c=${r.idCita} diff=${r.diff_min} to=${r.to_send} act=${r.mins_since_activation}`);

        }
      });
    },
    { timezone: 'UTC' }
  );
}

module.exports = { startCron };
