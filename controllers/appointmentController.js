const db = require('../config/db');
const Appointment = require('../models/appointmentModel');

function formatFechaHoraLocal(fecha) {
  if (!fecha) return null;
  const tzOffset = fecha.getTimezoneOffset() * 60000;
  const localDate = new Date(fecha.getTime() - tzOffset);
  return localDate.toISOString().slice(0, 19);
}

exports.obtenerCitas = (req, res) => {
  const userEmail = req.user?.email;

  if (!userEmail) {
    return res.status(401).json({ error: 'Token inválido o sin correo' });
  }

  const queryUsuario = 'SELECT idUsuario FROM usuario WHERE correo = ?';
  db.query(queryUsuario, [userEmail], (err, usuarioResult) => {
    if (err || usuarioResult.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userId = usuarioResult[0].idUsuario;

    Appointment.getAllByUserId(userId, (err, citasResult) => {
      if (err) {
        console.error('Error al obtener citas:', err);
        return res.status(500).json({ error: 'Error al obtener las citas' });
      }

      const citasFormateadas = citasResult.map(cita => ({
        id: cita.idCita,
        titulo: cita.titulo,
        estado: cita.estado,
        fecha_hora: formatFechaHoraLocal(cita.fecha_hora),
        recordatorio_activado: !!cita.recordatorio_activado,
        recordatorio_activado_at: cita.recordatorio_activado_at ? formatFechaHoraLocal(cita.recordatorio_activado_at) : null,
        doctor: {
          nombre: cita.nombre_odontologo,
          especialidad: cita.especialidad_odontologo,
          direccion_consultorio: cita.direccion_consultorio
        }
      }));

      console.log('Citas del usuario:', citasFormateadas);
      res.json(citasFormateadas);
    });
  });
};

exports.actualizarRecordatorio = (req, res) => {
  const idCita = req.params.id;
  const { activado } = req.body;

  if (typeof activado !== 'boolean') {
    return res.status(400).json({ error: 'El valor de activado debe ser booleano' });
  }

  Appointment.actualizarRecordatorio(idCita, activado, (err, result) => {
    if (err) {
      console.error('Error al actualizar recordatorio:', err);
      return res.status(500).json({ error: 'Error al actualizar el recordatorio' });
    }

    res.json({ success: true, mensaje: 'Recordatorio actualizado correctamente' });
  });
};
