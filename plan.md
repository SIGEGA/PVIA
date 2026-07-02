# Plan de Proyecto - Sistema de Punto de Venta (POS) Abarrotes y Frutería

## 1. Stack Tecnológico

### Backend
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Node.js | 20 LTS | Runtime de servidor |
| Express.js | 4.x | Framework HTTP / REST API |
| Supabase JS | 2.x | Cliente para Supabase (auth, db, storage) |
| jsonwebtoken | 9.x | Verificación de tokens JWT emitidos por Supabase |
| bcryptjs | 2.x | Hash de contraseñas (capa adicional si se gestiona fuera de Supabase Auth) |
| zod | 3.x | Validación y parseo de datos de entrada |
| cors | 2.x | Política de CORS |
| helmet | 7.x | Headers de seguridad HTTP |
| morgan | 1.x | Logger de peticiones HTTP |
| dotenv | 16.x | Variables de entorno |
| nodemon | 3.x | Recarga automática en desarrollo |

### Frontend
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 18.x | UI declarativa |
| Vite | 5.x | Bundler y servidor de desarrollo |
| React Router | 6.x | Enrutamiento en el cliente |
| Zustand | 4.x | Estado global ligero |
| TailwindCSS | 3.x | Estilos utilitarios |
| Axios | 1.x | Cliente HTTP para llamadas a la API |
| React Hook Form | 7.x | Manejo de formularios |
| Zod | 3.x | Validación de formularios (compartida con backend) |
| Recharts | 2.x | Gráficas para reportes |
| date-fns | 3.x | Manipulación de fechas |
| jsPDF + autoTable | 2.x | Generación de PDF en el cliente |

### Base de Datos / Infraestructura
| Tecnología | Propósito |
|-----------|-----------|
| Supabase | PostgreSQL gestionado, autenticación, Row Level Security (RLS) |
| Supabase Auth | Autenticación de usuarios (JWT), recuperación de contraseña, bloqueo de cuentas |
| Supabase Storage | Almacenamiento de respaldos y PDF generados |
| Supabase Realtime | Notificaciones en tiempo real (alertas de stock bajo) |

---

## 2. Arquitectura General

```
┌─────────────────────────────────────────┐
│           Cliente (Navegador)            │
│         React + Vite (puerto 5173)       │
└──────────────────┬──────────────────────┘
                   │ HTTP/REST (Axios)
┌──────────────────▼──────────────────────┐
│         Backend (Express.js)             │
│           Node.js (puerto 3000)          │
│  Middlewares: auth · validate · audit    │
└──────────────────┬──────────────────────┘
                   │ Supabase JS SDK
┌──────────────────▼──────────────────────┐
│               Supabase                   │
│  PostgreSQL · Auth · Storage · Realtime  │
└─────────────────────────────────────────┘
```

El frontend **nunca** accede directamente a Supabase; toda petición pasa por el backend de Express, que es el único con la `service_role` key. El frontend solo usa la `anon` key para suscripciones Realtime de solo lectura.

---

## 3. Estructura de Carpetas

### 3.1 Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── supabase.js          # Cliente Supabase con service_role
│   │   └── cors.js              # Opciones CORS por entorno
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js   # Verifica JWT y adjunta req.user
│   │   ├── rbac.middleware.js   # Control de acceso por rol
│   │   ├── validate.middleware.js  # Valida body con esquema Zod
│   │   ├── audit.middleware.js  # Registra operaciones en AUDITORIA
│   │   └── error.middleware.js  # Manejador global de errores
│   │
│   ├── routes/
│   │   ├── index.js             # Monta todos los routers bajo /api/v1
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── products.routes.js
│   │   ├── categories.routes.js
│   │   ├── sales.routes.js
│   │   ├── purchases.routes.js
│   │   ├── inventory.routes.js
│   │   ├── cashclose.routes.js
│   │   ├── reports.routes.js
│   │   ├── expenses.routes.js
│   │   └── settings.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── products.controller.js
│   │   ├── categories.controller.js
│   │   ├── sales.controller.js
│   │   ├── purchases.controller.js
│   │   ├── inventory.controller.js
│   │   ├── cashclose.controller.js
│   │   ├── reports.controller.js
│   │   ├── expenses.controller.js
│   │   └── settings.controller.js
│   │
│   ├── services/               # Lógica de negocio pura (sin Express)
│   │   ├── auth.service.js
│   │   ├── products.service.js
│   │   ├── sales.service.js
│   │   ├── purchases.service.js
│   │   ├── inventory.service.js
│   │   ├── cashclose.service.js
│   │   ├── reports.service.js
│   │   └── notifications.service.js  # Alertas de stock bajo
│   │
│   ├── schemas/                # Esquemas Zod compartibles con frontend
│   │   ├── product.schema.js
│   │   ├── sale.schema.js
│   │   ├── purchase.schema.js
│   │   ├── user.schema.js
│   │   └── cashclose.schema.js
│   │
│   ├── utils/
│   │   ├── response.js         # Helpers: success(), error(), paginate()
│   │   ├── pagination.js       # Lógica de paginación para Supabase
│   │   └── date.js             # Helpers de fecha/hora
│   │
│   └── app.js                  # Setup Express: middlewares globales, rutas
│
├── .env
├── .env.example
├── package.json
└── server.js                   # Entry point: inicia el servidor HTTP
```

### 3.2 Frontend

```
frontend/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── assets/
│   │   └── logo.svg
│   │
│   ├── components/             # Componentes reutilizables sin lógica de negocio
│   │   ├── ui/                 # Átomos: Button, Input, Badge, Modal, Table...
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── DataTable.jsx
│   │   │   └── Alert.jsx
│   │   └── layout/
│   │       ├── Sidebar.jsx
│   │       ├── Header.jsx
│   │       └── ProtectedRoute.jsx
│   │
│   ├── features/               # Un módulo por dominio funcional
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── ForgotPassword.jsx
│   │   ├── products/
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   └── ProductSearch.jsx
│   │   ├── sales/
│   │   │   ├── SaleCart.jsx
│   │   │   ├── SaleItem.jsx
│   │   │   ├── PaymentModal.jsx
│   │   │   └── ReceiptViewer.jsx
│   │   ├── inventory/
│   │   │   ├── StockEntryForm.jsx
│   │   │   ├── StockExitForm.jsx
│   │   │   └── LowStockAlert.jsx
│   │   ├── purchases/
│   │   │   ├── PurchaseList.jsx
│   │   │   └── PurchaseForm.jsx
│   │   ├── cashclose/
│   │   │   ├── CashCloseForm.jsx
│   │   │   └── CashCloseHistory.jsx
│   │   ├── reports/
│   │   │   ├── SalesReport.jsx
│   │   │   ├── InventoryReport.jsx
│   │   │   └── ProfitReport.jsx
│   │   ├── expenses/
│   │   │   └── ExpenseForm.jsx
│   │   └── settings/
│   │       ├── BusinessSettings.jsx
│   │       └── UserManagement.jsx
│   │
│   ├── hooks/                  # Custom hooks reutilizables
│   │   ├── useAuth.js
│   │   ├── useProducts.js
│   │   ├── useSale.js
│   │   ├── useInventory.js
│   │   └── useReports.js
│   │
│   ├── pages/                  # Una página por ruta; ensambla features
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── SalesPage.jsx
│   │   ├── InventoryPage.jsx
│   │   ├── PurchasesPage.jsx
│   │   ├── CashClosePage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── ExpensesPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── AuditPage.jsx
│   │
│   ├── routes/
│   │   └── AppRouter.jsx       # Define rutas y protección por rol
│   │
│   ├── services/               # Llamadas HTTP a la API Express
│   │   ├── api.js              # Instancia base de Axios con interceptores
│   │   ├── auth.service.js
│   │   ├── products.service.js
│   │   ├── sales.service.js
│   │   ├── inventory.service.js
│   │   ├── reports.service.js
│   │   └── cashclose.service.js
│   │
│   ├── store/                  # Estado global con Zustand
│   │   ├── authStore.js        # Usuario activo, rol, token
│   │   ├── saleStore.js        # Carrito de venta activo
│   │   └── notificationStore.js  # Alertas de stock
│   │
│   ├── utils/
│   │   ├── formatCurrency.js
│   │   ├── formatDate.js
│   │   └── roles.js            # Constantes de roles y permisos
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── .env.example
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 4. Convenciones de Nombres

### 4.1 Archivos y Carpetas

| Contexto | Convención | Ejemplo |
|---------|-----------|---------|
| Componentes React | PascalCase | `ProductForm.jsx`, `DataTable.jsx` |
| Hooks | camelCase con prefijo `use` | `useAuth.js`, `useSale.js` |
| Servicios frontend | camelCase con sufijo `service` | `products.service.js` |
| Controladores | camelCase con sufijo `controller` | `products.controller.js` |
| Servicios backend | camelCase con sufijo `service` | `sales.service.js` |
| Middlewares | camelCase con sufijo `middleware` | `auth.middleware.js` |
| Esquemas Zod | camelCase con sufijo `schema` | `product.schema.js` |
| Rutas Express | camelCase con sufijo `routes` | `products.routes.js` |
| Stores Zustand | camelCase con sufijo `Store` | `authStore.js` |

### 4.2 Variables y Funciones JavaScript

| Caso | Convención | Ejemplo |
|------|-----------|---------|
| Variables y funciones | camelCase | `totalFinal`, `getSaleById()` |
| Constantes globales | UPPER_SNAKE_CASE | `MAX_DISCOUNT_PERCENT`, `ROLES` |
| Clases | PascalCase | `AppError`, `SupabaseClient` |
| Booleanos | Prefijo `is`, `has`, `can` | `isActive`, `hasDiscount`, `canDelete` |
| Handlers React | Prefijo `handle` | `handleSubmit`, `handleDelete` |
| Funciones asíncronas | Verbo descriptivo | `fetchProducts()`, `createSale()` |

### 4.3 Rutas de la API REST

- Prefijo global: `/api/v1`
- Recursos en **kebab-case plural**
- Verbos HTTP representan la acción (no se incluyen en la URL)

```
GET    /api/v1/products              # Listar
GET    /api/v1/products/:id          # Obtener uno
POST   /api/v1/products              # Crear
PUT    /api/v1/products/:id          # Actualizar completo
PATCH  /api/v1/products/:id          # Actualizar parcial
DELETE /api/v1/products/:id          # Eliminar (lógico)

POST   /api/v1/sales                 # Nueva venta
POST   /api/v1/sales/:id/cancel      # Anular venta
GET    /api/v1/reports/sales         # Reporte de ventas
GET    /api/v1/reports/inventory     # Reporte de inventario
POST   /api/v1/cashclose             # Crear cierre de caja
GET    /api/v1/inventory/movements   # Movimientos de inventario
```

### 4.4 Base de Datos (Supabase / PostgreSQL)

| Elemento | Convención | Ejemplo |
|---------|-----------|---------|
| Tablas | snake_case, plural | `productos`, `detalle_venta`, `corte_caja` |
| Columnas | snake_case | `precio_venta`, `fecha_creacion`, `stock_actual` |
| Llaves primarias | Siempre `id` | `id SERIAL PRIMARY KEY` |
| Llaves foráneas | `<tabla_singular>_id` | `producto_id`, `usuario_id`, `empresa_id` |
| Campos booleanos | Prefijo `es_` o `tiene_` | `es_activo`, `tiene_iva` |
| Timestamps | `fecha_creacion`, `fecha_actualizacion` | — |
| Enums | snake_case minúsculas | `'activo'`, `'completada'`, `'entrada'` |
| Índices | `idx_<tabla>_<columna(s)>` | `idx_productos_codigo`, `idx_ventas_sucursal_fecha` |
| Funciones PG | snake_case con verbo | `calcular_total_venta()`, `restaurar_stock()` |

### 4.5 Variables de Entorno

```bash
# Backend .env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=...                      # Solo si se usa JWT propio
CORS_ORIGIN=http://localhost:5173

# Frontend .env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...       # Solo para Realtime
```

### 4.6 Git y Control de Versiones

| Tipo | Prefijo | Ejemplo |
|------|---------|---------|
| Nueva funcionalidad | `feature/` | `feature/sales-module` |
| Corrección de bug | `fix/` | `fix/stock-validation` |
| Mejora técnica | `chore/` | `chore/setup-eslint` |
| Documentación | `docs/` | `docs/api-endpoints` |
| Hotfix urgente | `hotfix/` | `hotfix/login-blocked` |

**Mensajes de commit** (Conventional Commits):
```
feat(sales): agregar cálculo automático de vuelto
fix(inventory): corregir validación de stock mínimo
chore(deps): actualizar Supabase JS a 2.45
docs(api): documentar endpoints de reportes
```

---

## 5. Módulos y Correspondencia con Historias de Usuario

| Módulo | US cubiertos | Ruta frontend | Roles con acceso |
|--------|-------------|---------------|-----------------|
| Autenticación | US-019 | `/login` | Todos |
| Productos | US-001, 002, 003, 004 | `/products` | Vendedor, Gerente, Admin |
| Ventas (POS) | US-005, 006, 007, 008, 009 | `/sales` | Vendedor, Gerente |
| Inventario | US-010, 011, 012, 013 | `/inventory` | Vendedor, Gerente, Admin |
| Compras | US-010 | `/purchases` | Gerente, Admin |
| Cierre de caja | US-014, 015 | `/cashclose` | Gerente, Admin |
| Reportes | US-012, 015, 016, 017 | `/reports` | Gerente, Admin |
| Usuarios | US-018 | `/settings/users` | Admin |
| Auditoría | US-020 | `/audit` | Admin |
| Configuración | US-021, 022 | `/settings` | Admin |

---

## 6. Decisiones de Diseño Clave

1. **Supabase como BaaS**: Elimina la necesidad de gestionar un servidor PostgreSQL propio. El backend Express actúa como proxy de negocio y aplicación de reglas, usando la `service_role` key para operaciones privilegiadas.

2. **Row Level Security (RLS) desactivado en backend**: El backend usa la `service_role` key que salta RLS. La seguridad se aplica en los middlewares de Express (`rbac.middleware.js`). RLS puede activarse como capa adicional en el futuro.

3. **Soft delete**: Los productos y usuarios nunca se eliminan físicamente — se marca `estado = 'inactivo'` (US-004). Todas las queries incluyen `WHERE estado = 'activo'` por defecto.

4. **Auditoría automática**: El `audit.middleware.js` registra automáticamente en la tabla `AUDITORIA` toda operación de escritura (POST/PUT/PATCH/DELETE), capturando usuario, IP y datos antes/después.

5. **Realtime para alertas de stock**: El frontend suscribe al canal de Supabase Realtime para recibir notificaciones de stock bajo sin polling (US-013).

6. **PDF en cliente**: Los comprobantes de venta y reportes se generan con `jsPDF` directamente en el navegador, sin carga en el servidor.
