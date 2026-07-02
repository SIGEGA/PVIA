# ITH-POS — Sistema de Punto de Venta

Sistema web de punto de venta para abarrotes y frutería, desarrollado para el ITH.
Permite registrar ventas, controlar inventario, gestionar compras a proveedores y generar reportes gerenciales.

---

## Tabla de contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Correr en desarrollo](#correr-en-desarrollo)
- [Pruebas](#pruebas)
- [Documentación de la API](#documentación-de-la-api)
- [Roles y permisos](#roles-y-permisos)
- [Estructura de carpetas](#estructura-de-carpetas)

---

## Características

- **Ventas** — registro en tiempo real con cálculo de cambio, IVA (16 %) y descuentos; comprobante en PDF
- **Inventario** — movimientos de entrada / salida / ajuste, alerta de stock bajo
- **Compras** — órdenes de compra a proveedores con actualización automática de stock
- **Corte de caja** — cierre diario con conteo físico, diferencia sobrante/faltante y PDF
- **Reportes** — resumen diario, ventas por período, productos más vendidos, inventario valorizado
- **Catálogos** — categorías, proveedores, clientes y unidades de medida
- **Gestión de usuarios** — roles jerárquicos, cambio de contraseña, activar/desactivar
- **API documentada** — Swagger UI integrado en `/api-docs`

---

## Tecnologías

### Backend
| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Token HMAC-SHA256 + bcrypt |
| Documentación | swagger-ui-express (OpenAPI 3.0) |
| Testing | Jest 30 + Babel |
| Dev server | nodemon |

### Frontend
| Capa | Tecnología |
|------|-----------|
| Framework | React 19 + Vite 8 |
| Estilos | TailwindCSS 3 |
| Estado global | Zustand 5 |
| HTTP | Axios |
| Formularios | React Hook Form + Zod |
| Gráficas | Recharts |
| PDF | jsPDF + jspdf-autotable |
| Enrutamiento | React Router 7 |

---

## Requisitos previos

- **Node.js** v18 o superior (`node -v` para verificar)
- **npm** v9 o superior
- Cuenta en **[Supabase](https://supabase.com)** con las tablas del schema ya aplicadas

---

## Instalación

Clona el repositorio e instala las dependencias de cada parte por separado.

```bash
git clone <url-del-repositorio>
cd ProyectoPV
```

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

---

## Variables de entorno

### Backend — `backend/.env`

Crea el archivo copiando el ejemplo:
```bash
cp backend/.env.example backend/.env
```

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto en que escucha el servidor | `3001` |
| `SUPABASE_URL` | URL del proyecto en Supabase | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Clave pública (anon key) de Supabase | `eyJhbGci...` |
| `FRONTEND_URL` | Origen permitido por CORS | `http://localhost:5173` |

> **Nota:** nunca subas el archivo `.env` al repositorio.
> La `SUPABASE_ANON_KEY` es la clave anónima (pública), no la `service_role`.

### Frontend — `frontend/.env`

```bash
cp frontend/.env.example frontend/.env
```

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de la API REST | `http://localhost:3001/api` |

---

## Correr en desarrollo

Abre **dos terminales** en la raíz del proyecto.

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
El servidor arranca en `http://localhost:3001`.

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
La aplicación abre en `http://localhost:5173`.

### Otros comandos útiles

```bash
# Backend — producción
npm start

# Frontend — build de producción
npm run build

# Frontend — previsualizar el build
npm run preview

# Frontend — lint
npm run lint
```

> Si ves el error `Puerto 3001 ocupado`, ejecuta:
> ```
> netstat -ano | findstr :3001
> taskkill /PID <PID> /F
> ```

---

## Pruebas

Las pruebas del backend usan Jest con Babel para soporte CommonJS.

```bash
cd backend

# Ejecutar todos los tests
npm test

# Con reporte de cobertura
npm run test:coverage
```

**Suites incluidas:**

| Archivo | Escenarios cubiertos |
|---------|----------------------|
| `__tests__/sale.test.js` | Stock insuficiente (409/404), cálculo de subtotal, IVA 16 %, descuento global, cambio en efectivo |
| `__tests__/cashclose.test.js` | Agrupación por método de pago, corte duplicado (409), cálculo de diferencia positiva/negativa/cero |

---

## Documentación de la API

Con el servidor corriendo, abre en el navegador:

```
http://localhost:3001/api-docs
```

La documentación Swagger UI cubre los **38 endpoints** con parámetros, ejemplos de request/response y códigos de error.

**Cómo autenticarse en la UI:**
1. Llama a `POST /usuarios/login` con tus credenciales
2. Copia el campo `token` de la respuesta
3. Haz clic en el botón **Authorize** (🔓) en la parte superior
4. Pega el token — se aplicará a todas las peticiones

---

## Roles y permisos

El sistema tiene tres roles en jerarquía ascendente:

| Rol | Acceso |
|-----|--------|
| `vendedor` | Registrar ventas, consultar productos e inventario |
| `gerente` | Todo lo anterior + crear/editar productos, gestionar compras, proveedores, corte de caja y reportes |
| `administrador` | Acceso total + gestión de usuarios (crear, editar, activar/desactivar) |

---

## Estructura de carpetas

```
ProyectoPV/
│
├── backend/                        # API REST Node.js + Express
│   ├── src/
│   │   ├── app.js                  # Configuración Express (middleware, rutas, Swagger)
│   │   ├── server.js               # Punto de entrada — arranca el servidor
│   │   ├── config/
│   │   │   └── supabase.js         # Cliente Supabase
│   │   ├── controllers/            # Validan entrada y orquestan la respuesta HTTP
│   │   │   ├── cashclose-controller.js
│   │   │   ├── catalog-controller.js
│   │   │   ├── inventory-controller.js
│   │   │   ├── product-controller.js
│   │   │   ├── purchase-controller.js
│   │   │   ├── report-controller.js
│   │   │   ├── sale-controller.js
│   │   │   └── user-controller.js
│   │   ├── services/               # Lógica de negocio y acceso a Supabase
│   │   │   ├── cashclose-service.js
│   │   │   ├── catalog-service.js
│   │   │   ├── inventory-service.js
│   │   │   ├── product-service.js
│   │   │   ├── purchase-service.js
│   │   │   ├── report-service.js
│   │   │   ├── sale-service.js
│   │   │   └── user-service.js
│   │   ├── routes/                 # Definición de rutas y guards de rol
│   │   │   ├── index.js
│   │   │   ├── cashclose-routes.js
│   │   │   ├── catalog-routes.js
│   │   │   ├── inventory-routes.js
│   │   │   ├── product-routes.js
│   │   │   ├── purchase-routes.js
│   │   │   ├── report-routes.js
│   │   │   ├── sale-routes.js
│   │   │   └── user-routes.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  # authenticate + authorize(roles)
│   │   │   └── errorHandler.js     # Manejador global de errores
│   │   ├── docs/
│   │   │   └── swagger.js          # Especificación OpenAPI 3.0
│   │   └── utils/
│   │       ├── response.js         # Helpers success() / error()
│   │       └── token.js            # Firma y verificación HMAC-SHA256
│   ├── __tests__/
│   │   ├── sale.test.js
│   │   └── cashclose.test.js
│   ├── babel.config.js
│   ├── jest.config.js
│   ├── .env.example
│   └── package.json
│
├── frontend/                       # SPA React + Vite
│   ├── src/
│   │   ├── main.jsx                # Punto de entrada React
│   │   ├── App.jsx                 # Providers globales (Router, Toast)
│   │   ├── routes/
│   │   │   └── AppRouter.jsx       # Rutas con ProtectedRoute por rol
│   │   ├── pages/                  # Una página por módulo
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── SalesPage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── InventoryPage.jsx
│   │   │   ├── PurchasesPage.jsx
│   │   │   ├── SuppliersPage.jsx
│   │   │   ├── CashClosePage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── features/               # Componentes específicos de cada módulo
│   │   │   ├── auth/               # LoginForm
│   │   │   ├── sales/              # ProductSearch, SaleCart, PaymentModal, ReceiptModal
│   │   │   ├── products/           # ProductList, ProductForm
│   │   │   └── cashclose/          # CashCloseForm, CashCloseHistory
│   │   ├── components/
│   │   │   ├── layout/             # MainLayout, Sidebar, Header, ProtectedRoute
│   │   │   └── ui/                 # Button, Input, Modal, DataTable, Badge, Toast
│   │   ├── services/               # Llamadas a la API (Axios)
│   │   │   ├── api.js              # Instancia Axios con interceptor de token
│   │   │   ├── auth.service.js
│   │   │   ├── products.service.js
│   │   │   ├── sales.service.js
│   │   │   ├── inventory.service.js
│   │   │   ├── purchases.service.js
│   │   │   ├── suppliers.service.js
│   │   │   ├── cashclose.service.js
│   │   │   ├── reports.service.js
│   │   │   └── catalog.service.js
│   │   ├── store/                  # Estado global Zustand
│   │   │   ├── authStore.js        # Usuario autenticado (persistido en localStorage)
│   │   │   ├── saleStore.js        # Carrito de venta activo
│   │   │   └── toastStore.js       # Notificaciones (auto-eliminación 3 s)
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useProducts.js
│   │   │   └── useToast.js
│   │   └── utils/
│   │       ├── formatCurrency.js
│   │       ├── formatDate.js
│   │       └── roles.js
│   ├── .env.example
│   └── package.json
│
├── database/
│   └── schema.sql                  # DDL completo (PostgreSQL / Supabase)
│
└── README.md
```

---

## Flujo de autenticación

```
Cliente                     Backend                    Supabase
  │                            │                           │
  │── POST /usuarios/login ───>│                           │
  │   { email, password }      │── SELECT usuarios ───────>│
  │                            │<── { hash, rol, ... } ────│
  │                            │   bcrypt.compare()        │
  │<── { token, user } ────────│   sign(HMAC-SHA256)       │
  │                            │                           │
  │── GET /api/... ───────────>│                           │
  │   Authorization: Bearer    │   verify(token)           │
  │                            │   req.user = payload      │
  │<── { success, data } ──────│── supabase.from()... ────>│
```

El token se almacena en `localStorage` y se adjunta automáticamente a cada petición mediante un interceptor de Axios.

---

## Licencia

Proyecto académico — Instituto Tecnológico de Hermosillo (ITH). Uso educativo.
