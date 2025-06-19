# Drteeth API

**Drteeth API** es un backend RESTful desarrollado en Node.js y Express que sirve como motor principal para la aplicación móvil Drteeth. Gestiona funcionalidades clínicas como citas odontológicas, tratamientos, discapacidades, urgencias dentales, autenticación de usuarios y pagos, conectándose a una base de datos MySQL.

---

## Tecnologías utilizadas

- **Node.js** + **Express.js** — Servidor web y routing
- **MySQL** — Base de datos relacional
- **Dotenv** — Gestión de variables de entorno
- **CORS & Body-parser** — Middleware esencial
- **Arquitectura modular basada en MVC (Modelo-Vista-Controlador)**

---

## Funcionalidades del backend

- Autenticación de usuarios
- Gestión de citas médicas
- Gestión de tratamientos
- Consulta de incapacidades
- Emergencias dentales
- Procesamiento y registro de pagos

---

## Arquitectura del proyecto

El backend sigue el patrón **MVC (Modelo-Vista-Controlador)**:

```
drteeth-api/
├── controllers/     # Lógica de negocio
│   ├── loginController.js
│   ├── appointmentController.js
│   └── ...
├── routes/          # Endpoints y routing
│   ├── loginRoutes.js
│   ├── appointmentRoutes.js
│   └── ...
├── models/          # Consultas a la base de datos
│   ├── db.js
│   └── models.js
├── database/        # Scripts de inicialización / conexión
│   └── connection.js
├── .env.example     # Variables de entorno
├── app.js           # Punto de entrada
└── package.json
```

---

## ⚙️ Instalación y ejecución

```bash
git clone https://github.com/Juancamilo/drteeth-api.git
cd drteeth-api
npm install
cp .env.example .env  # Crea tu archivo de entorno
node app.js
```

---

## 🔐 Variables de entorno (.env)

Ejemplo de archivo `.env`:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_clave
DB_NAME=drteeth
```

---

## 🧪 Endpoints principales

| Método | Ruta                     | Descripción                         |
|--------|--------------------------|-------------------------------------|
| POST   | /api/login               | Autenticación de usuarios           |
| POST   | /api/register            | Registrar nuevo usuario             |
| GET    | /api/appointments        | Listar nueva cita                   |
| GET    | /api/treatments          | Obtener tratamientos                |
| GET    | /api/disabilities        | Consultar incapacidades             |

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más información.
