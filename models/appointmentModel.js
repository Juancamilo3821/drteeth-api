const db = require('../config/db');

const Appointment = {
  getAllByUserId: (userId, callback) => {
    const query = `
      SELECT 
        c.idCita, c.titulo, c.estado, c.fecha_hora,
        o.nombre AS nombre_odontologo,
        o.especialidad AS especialidad_odontologo,
        o.direccion_consultorio
      FROM citas c
      JOIN perfil_odontologo o ON c.Perfil_Odontologo_idPerfil_Odontologo = o.idPerfil_Odontologo
      WHERE c.Usuario_idUsuario = ?
    `;
    db.query(query, [userId], callback);
  },
};

module.exports = Appointment;
