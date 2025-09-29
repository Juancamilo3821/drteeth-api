// cronNotifications.js
const cron = require('node-cron');
const admin = require('../config/firebaseAdmin');
const { pool } = require('../config/db');

function startCron(injectedPool) {
  const usePool = injectedPool || pool;

  // Corre cada minuto con base UTC
  cron.schedule(
    '* * * * *',
    async () => {
      const query = `
        SELECT
          c.idCita,
          u.numeroDocumento,
          u.fcm_token,

          -- Hora guardada (local Bogotá)
          c.fecha_hora AS fecha_local_bo,

          -- Misma cita llevada a UTC (Bogotá -05:00, sin DST)
          DATE_ADD(c.fecha_hora, INTERVAL 5 HOUR) AS fecha_utc,

          c.recordatorio_activado,
          c.recordatorio_activado_at,
          c.notificado_3h,
          c.notificado_24h,

          -- Diferencia en MINUTOS entre ahora (UTC) y la cita (ya en UTC)
          TIMESTAMPDIFF(
            MINUTE,
            UTC_TIMESTAMP(),
            DATE_ADD(c.fecha_hora, INTERVAL 5 HOUR)
          ) AS diff_min,

          -- EXACTO por minuto: ventanas [3h,3h+1min) y [24h,24h+1min)
          CASE
            WHEN c.notificado_3h = 0
             AND DATE_ADD(c.fecha_hora, INTERVAL 5 HOUR) >= DATE_ADD(UTC_TIMESTAMP(), INTERVAL 3 HOUR)
             AND DATE_ADD(c.fecha_hora, INTERVAL 5 HOUR) <  DATE_ADD(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 3 HOUR), INTERVAL 1 MINUTE)
              THEN '3h'
            WHEN c.notificado_24h = 0
             AND DATE_ADD(c.fecha_hora, INTERVAL 5 HOUR) >= DATE_ADD(UTC_TIMESTAMP(), INTERVAL 24 HOUR)
             AND DATE_ADD(c.fecha_hora, INTERVAL 5 HOUR) <  DATE_ADD(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 24 HOUR), INTERVAL 1 MINUTE)
              THEN '24h'
            ELSE NULL
          END AS to_send,

          -- Mins desde que activó recordatorios (para mensaje informativo)
          TIMESTAMPDIFF(MINUTE, c.recordatorio_activado_at, UTC_TIMESTAMP()) AS mins_since_activation,

          -- Hora local para cuerpo del mensaje (tal como está guardada)
          DATE_FORMAT(c.fecha_hora, '%H:%i') AS hora_local_bo
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

        // Reloj de referencia (UTC)
        const nowUtc = new Date().toISOString();
        console.log(`[cron] now(UTC)=${nowUtc} rows=${rows.length}`);

        for (const r of rows) {
          try {
            let titulo = '';
            let cuerpo = '';
            let colUpdate = null;

            // Diagnóstico
            console.log(
              `[cron] D c=${r.idCita} diff=${r.diff_min} to=${r.to_send} act=${r.mins_since_activation} fecha_utc=${r.fecha_utc}`
            );

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
              // Aviso único ~3 min después de activar
              titulo = 'Notificaciones activadas';
              cuerpo = 'Recibirás tus recordatorios 24h y 3h antes de tu cita.';
              // sin update de flags
            }

            if (!titulo) continue;

            await admin.messaging().send({
              token: r.fcm_token,
              notification: { title: titulo, body: cuerpo },
              android: {
                priority: 'high',
                notification: { channelId: 'citas' },
              },
              apns: { payload: { aps: { sound: 'default' } } },
            });

            console.log(
              `[cron] push a ${r.numeroDocumento} (cita=${r.idCita}) → ${titulo}`
            );

            if (colUpdate) {
              usePool.query(
                `UPDATE citas SET ${colUpdate} = 1 WHERE idCita = ? AND ${colUpdate} = 0`,
                [r.idCita],
                (uerr) => {
                  if (uerr) {
                    console.error(`[cron] update ${colUpdate} cita=${r.idCita}:`, uerr);
                  } else {
                    console.log(`[cron] marcado ${colUpdate}=1 cita=${r.idCita}`);
                  }
                }
              );
            }
          } catch (e) {
            console.error(`[cron] FCM err cita=${r.idCita}:`, e?.errorInfo || e);
          }
        }
      });
    },
    { timezone: 'UTC' }
  );
}

module.exports = { startCron };
