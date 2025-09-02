// cronNotifications.js
const cron = require('node-cron');
const admin = require('../config/firebaseAdmin');
const { pool } = require('../config/db');

/**
 * Inicia el cron que revisa citas y envía notificaciones.
 *
 * Supuestos:
 * - c.fecha_hora está guardada en hora local Bogotá (America/Bogota).
 * - Comparamos siempre contra UTC en el cron para evitar líos de TZ del contenedor,
 *   convirtiendo c.fecha_hora -> UTC con CONVERT_TZ(..., 'America/Bogota', '+00:00').
 *
 * Cambio clave:
 * - Enviar 24h/3h SOLO en el minuto exacto (ventana de 1 min), no con rangos amplios.
 */
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

          -- Fecha/hora original (local Bogotá)
          c.fecha_hora AS fecha_local_bo,

          -- Misma cita en UTC para comparar
          CONVERT_TZ(c.fecha_hora, 'America/Bogota', '+00:00') AS fecha_utc,

          c.recordatorio_activado,
          c.recordatorio_activado_at,
          c.notificado_3h,
          c.notificado_24h,

          -- diferencia en minutos entre AHORA (UTC) y la cita (ya en UTC)
          TIMESTAMPDIFF(
            MINUTE,
            UTC_TIMESTAMP(),
            CONVERT_TZ(c.fecha_hora, 'America/Bogota', '+00:00')
          ) AS diff_min,

          -- EXACTO por minuto: 3h y 24h (ventana [t, t+1min) desde ahora)
          CASE
            WHEN c.notificado_3h = 0
             AND CONVERT_TZ(c.fecha_hora, 'America/Bogota', '+00:00') >= DATE_ADD(UTC_TIMESTAMP(), INTERVAL 3 HOUR)
             AND CONVERT_TZ(c.fecha_hora, 'America/Bogota', '+00:00') <  DATE_ADD(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 3 HOUR), INTERVAL 1 MINUTE)
              THEN '3h'
            WHEN c.notificado_24h = 0
             AND CONVERT_TZ(c.fecha_hora, 'America/Bogota', '+00:00') >= DATE_ADD(UTC_TIMESTAMP(), INTERVAL 24 HOUR)
             AND CONVERT_TZ(c.fecha_hora, 'America/Bogota', '+00:00') <  DATE_ADD(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 24 HOUR), INTERVAL 1 MINUTE)
              THEN '24h'
            ELSE NULL
          END AS to_send,

          -- minutos desde que el usuario activó los recordatorios
          -- (si recordatorio_activado_at está en UTC, esto es exacto; si está en Bogotá,
          --  el desfase será de ~5h, pero solo afecta al aviso "activadas")
          TIMESTAMPDIFF(
            MINUTE,
            c.recordatorio_activado_at,
            UTC_TIMESTAMP()
          ) AS mins_since_activation,

          -- hora para mostrar en el cuerpo (local Bogotá)
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

        for (const r of rows) {
          try {
            let titulo = '';
            let cuerpo = '';
            let colUpdate = null;

            // Diagnóstico (útil para probar)
            console.log(
              `[cron] D c=${r.idCita} diff=${r.diff_min} to=${r.to_send} act=${r.mins_since_activation} local=${r.fecha_local_bo}`
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

            console.log(
              `[cron] ✅ push a ${r.numeroDocumento} (cita=${r.idCita}) → ${titulo}`
            );

            if (colUpdate) {
              usePool.query(
                `UPDATE citas SET ${colUpdate} = 1 WHERE idCita = ? AND ${colUpdate} = 0`,
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
        }
      });
    },
    { timezone: 'UTC' }
  );
}

module.exports = { startCron };
