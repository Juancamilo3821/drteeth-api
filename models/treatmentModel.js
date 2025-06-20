const db = require('../config/db');

const Treatment = {
  getByUserEmail: (email, callback) => {
    const query = `
      SELECT 
        tratamiento.idTratamiento,
        tratamiento.nombre,
        tratamiento.estado,
        tratamiento.fecha_inicio,
        tratamiento.fecha_fin,
        tratamiento.descripcion,
        perfil_odontologo.nombre AS nombre_odontologo,
        perfil_odontologo.especialidad AS especialidad_odontologo,
        perfil_odontologo.direccion_consultorio,
        medicamento.nombre AS nombre_medicamento,
        medicamento.dosis,
        medicamento.frecuenciaHoras
      FROM tratamiento
      JOIN usuario ON tratamiento.Usuario_idUsuario = usuario.idUsuario
      JOIN perfil_odontologo 
        ON tratamiento.Perfil_Odontologo_idPerfil_Odontologo = perfil_odontologo.idPerfil_Odontologo
      LEFT JOIN medicamento
        ON tratamiento.idTratamiento = medicamento.Tratamiento_idTratamiento
      WHERE usuario.correo = ?`;

    db.query(query, [email], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results);
    });
  }
};

module.exports = Treatment;