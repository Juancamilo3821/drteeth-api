const Disabilitie = require('../models/disabilitieModel');

exports.obtenerIncapacidades = (req, res) => {
  Disabilitie.getAll((err, results) => {
    if (err) {
      console.error('Error al obtener incapacidades:', err);
      return res.status(500).json({ error: 'Error al obtener las incapacidades' });
    }

    const datosFormateados = results.map(item => {
      return {
        id: item.idIncapacidad,
        titulo: item.titulo,
        fecha_inicio: item.fecha_inicio,
        fecha_fin: item.fecha_fin,
        duracion_dias: item.duracion_dias,
        motivo: item.motivo,
        estado: item.estado,
        archivo_pdf: item.archivo_pdf,
        usuario_id: item.Usuario_idUsuario,
        doctor: {
          nombre: item.nombre_odontologo,
          especialidad: item.especialidad_odontologo,
          direccion_consultorio: item.direccion_consultorio
        }
      };
    });

    console.log('📦 Incapacidades formateadas que se envían al cliente:', datosFormateados);

    res.status(200).json(datosFormateados);
  });
};
