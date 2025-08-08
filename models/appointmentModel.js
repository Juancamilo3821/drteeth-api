const db = require('../config/db');

const Appointment = {
  getAllByUserId: (userId, callback) => {
    const query = `
      SELECT 
        c.idCita, 
        c.titulo, 
        c.estado, 
        c.fecha_hora,
        c.recordatorio_activado,
        c.recordatorio_activado_at,
        o.nombre AS nombre_odontologo,
        o.especialidad AS especialidad_odontologo
      FROM citas c
      JOIN perfil_odontologo o ON c.Perfil_Odontologo_idPerfil_Odontologo = o.idPerfil_Odontologo
      WHERE c.Usuario_idUsuario = ?
      ORDER BY c.fecha_hora ASC
    `;
    db.query(query, [userId], callback);
  },

  actualizarRecordatorio: (idCita, activado, callback) => {
    const fecha = activado ? new Date() : null;
    const query = `
      UPDATE citas 
      SET 
        recordatorio_activado = ?, 
        recordatorio_activado_at = ?
      WHERE idCita = ?
    `;
    db.query(query, [activado ? 1 : 0, fecha, idCita], callback);
  }
};

module.exports = Appointment;
