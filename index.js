require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const disabilitieRoutes = require('./routes/disabilitieRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');
const logger = require('./middleware/logger');
const pingRoutes = require('./routes/pingRoutes');

// (Se mantiene el require original del cron)
require('./middleware/cronNotifications');

const { db, pool, ping } = require('./config/db');
// NUEVO: importo el startCron
const { startCron } = require('./middleware/cronNotifications');

const app = express();

// Middlewares
app.use(express.json());
app.use(logger);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', appointmentRoutes); 
app.use('/api/disabilitie', disabilitieRoutes);
app.use('/api/treatment', treatmentRoutes);
app.use('/ping', pingRoutes);

// Conexión a la base de datos (se mantiene tu connect original para loguear estado)
db.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos (conexión única):', err);
  } else {
    console.log('Conectado a la base de datos MySQL (conexión única)');
  }
});

// Iniciar el servidor SOLO cuando la DB via pool responda y luego arrancar el cron
const PORT = process.env.PORT || 3000;

ping((err) => {
  if (err) {
    console.error('❌ DB init failed (pool):', err);
    process.exit(1); // evita que la app quede viva sin DB
  } else {
    console.log('✅ Conexión a DB OK (pool)');
    // Arranca el cron DESPUÉS de la DB OK
    startCron(pool);

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  }
});
