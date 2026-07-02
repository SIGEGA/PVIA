require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const swaggerUi  = require('swagger-ui-express');
const swaggerDoc = require('./docs/swagger');

const routes       = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Swagger UI — disponible en /api-docs (sin autenticación)
// helmet interfiere con los assets de swagger-ui, así que se monta antes
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDoc, {
    customSiteTitle: 'ITH-POS API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
  })
);

// Seguridad y utilidades HTTP (después de /api-docs para que helmet no bloquee sus assets)
const helmet = require('helmet');
app.use(helmet({ contentSecurityPolicy: false }));
// CORS: acepta el frontend configurado en env; en Railway ambas variables
// (FRONTEND_URL y RAILWAY_PUBLIC_DOMAIN) deben apuntar al dominio del frontend.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permite solicitudes sin origin (Postman, curl, swagger-ui server-side)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Todas las rutas de la API bajo /api
app.use('/api', routes);

// Raíz — redirige a la documentación interactiva
app.get('/', (req, res) => {
  res.redirect(301, '/api-docs');
});

// Health check — usado por Railway y otros orquestadores para verificar que el servicio vive
app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date() } });
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Ruta ${req.method} ${req.path} no encontrada` });
});

// Manejador global de errores (debe ser el último middleware)
app.use(errorHandler);

module.exports = app;
