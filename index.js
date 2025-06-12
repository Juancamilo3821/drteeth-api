const express = require('express');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const disabilitieRoutes = require('./routes/disabilitieRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');
const logger = require('./middleware/logger');
const db = require('./config/db');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(logger);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', appointmentRoutes); 
app.use('/api/disabilitie', disabilitieRoutes);
app.use('/api/treatment', treatmentRoutes);


// Conexión a la base de datos
db.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos MySQL');
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
