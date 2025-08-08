const Disabilitie = require('../models/disabilitieModel');

exports.obtenerIncapacidades = (req, res) => {
  const email = req.user?.email;

  if (!email) {
    return res.status(400).json({ error: 'Email no proporcionado en el token' });
  }

  Disabilitie.getAllByEmail(email, (err, results) => {
    if (err) {
      console.error('Error al obtener incapacidades:', err);
      return res.status(500).json({ error: 'Error al obtener las incapacidades' });
    }

    const datosFormateados = results.map(item => ({
      id: item.idIncapacidad,
      titulo: item.titulo,
      fecha_inicio: item.fecha_inicio,
      fecha_fin: item.fecha_fin,
      duracion_dias: item.duracion_dias,
      motivo: item.motivo,
      estado: item.estado,
      archivo_pdf: item.archivo_pdf,
      doctor: {
        nombre: item.nombre_odontologo,
        especialidad: item.especialidad_odontologo,
        direccion_consultorio: item.direccion_consultorio
      }
    }));

    console.log('Incapacidades formateadas que se envían al cliente:', datosFormateados);
    res.status(200).json(datosFormateados);
  });
};
