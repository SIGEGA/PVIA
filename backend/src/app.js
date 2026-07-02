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
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(morgan('dev'));
app.use(express.json());

// Todas las rutas de la API bajo /api
app.use('/api', routes);

// Health check — no requiere autenticación
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
