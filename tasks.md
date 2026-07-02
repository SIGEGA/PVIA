# Tasks - Backend del Sistema POS

Cada tarea es atómica y tiene un criterio de terminación verificable.  
Orden: las tareas con dependencias están listadas después de sus dependencias.

---

## FASE 0 — Configuración del Proyecto

### T-001 Inicializar repositorio y estructura de carpetas
- Crear `backend/` con la estructura definida en `plan.md` (src/config, controllers, middlewares, routes, services, schemas, utils)
- Crear `backend/.env.example` con todas las variables requeridas (`PORT`, `NODE_ENV`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGIN`)
- **Terminado cuando:** `npm install` en `backend/` no arroja errores y `node server.js` inicia sin fallar.

### T-002 Instalar y configurar dependencias de producción
- Instalar: `express`, `@supabase/supabase-js`, `zod`, `cors`, `helmet`, `morgan`, `dotenv`, `jsonwebtoken`, `bcryptjs`
- **Terminado cuando:** todas las dependencias aparecen en `package.json` y se importan sin error en `app.js`.

### T-003 Instalar y configurar dependencias de desarrollo
- Instalar: `nodemon`, `eslint`, `prettier`
- Agregar scripts en `package.json`: `"dev": "nodemon server.js"`, `"start": "node server.js"`, `"lint": "eslint src/"`
- **Terminado cuando:** `npm run dev` arranca el servidor y se reinicia al guardar cualquier archivo en `src/`.

### T-004 Configurar cliente Supabase
- Crear `src/config/supabase.js` que exporta un cliente Supabase usando `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`
- **Terminado cuando:** importar el cliente y ejecutar `supabase.from('usuarios').select('id').limit(1)` devuelve una respuesta sin error de conexión.

### T-005 Configurar app.js con middlewares globales
- Registrar en orden: `helmet()`, `cors(corsOptions)`, `morgan('dev')`, `express.json()`, montaje de rutas bajo `/api/v1`, manejador 404, manejador global de errores
- **Terminado cuando:** `GET /api/v1` devuelve `{ ok: true }` y una ruta inexistente devuelve `404` con cuerpo JSON `{ error: 'Not found' }`.

### T-006 Implementar helper de respuestas estándar
- Crear `src/utils/response.js` con funciones `success(res, data, status=200)` y `error(res, message, status=400, details=null)`
- Formato de éxito: `{ ok: true, data }` — Formato de error: `{ ok: false, error, details }`
- **Terminado cuando:** los helpers son usados en al menos un controlador y la respuesta tiene exactamente esa forma en Postman/curl.

---

## FASE 1 — Base de Datos en Supabase

### T-007 Crear tabla `empresas`
- Ejecutar migración SQL en Supabase con los campos del `db-diagram.md`
- **Terminado cuando:** la tabla existe en Supabase Dashboard y acepta un INSERT con todos los campos requeridos.

### T-008 Crear tabla `sucursales`
- Incluir FK a `empresas(id)` con `ON DELETE RESTRICT`
- **Terminado cuando:** insertar una sucursal con `empresa_id` válido funciona; con `empresa_id` inexistente falla con error FK.

### T-009 Crear tabla `usuarios`
- Incluir FK a `empresas` y `sucursales`, campo `rol` como enum `('vendedor','gerente','administrador')`, campo `estado` como enum `('activo','inactivo')`
- **Terminado cuando:** el campo `correo` tiene restricción UNIQUE y se rechaza un duplicado.

### T-010 Crear tablas `categorias` y `productos`
- `categorias`: FK a `empresas` y `sucursales`, nombre con UNIQUE por sucursal
- `productos`: FK a `categorias`, campos `precio_venta` y `costo_unitario` como DECIMAL(10,2), `stock_actual` como DECIMAL(10,3) (admite decimales para frutas), índice en `(sucursal_id, codigo)`
- **Terminado cuando:** insertar un producto con código duplicado en la misma sucursal falla con error UNIQUE.

### T-011 Crear tablas `clientes` y `proveedores`
- Ambas con FK a `empresas` y `sucursales`
- `clientes`: enum `tipo ('normal','mayorista')`
- **Terminado cuando:** las tablas existen y aceptan INSERTs válidos.

### T-012 Crear tablas `ventas` y `detalle_venta`
- `ventas`: enum `estado ('completada','anulada','pendiente')`, enum `forma_pago ('efectivo','tarjeta','cheque','transferencia')`, `numero_transaccion` UNIQUE
- `detalle_venta`: FK a `ventas` y `productos`, `cantidad` DECIMAL(10,3)
- **Terminado cuando:** insertar un `detalle_venta` sin `venta_id` válido falla con error FK.

### T-013 Crear tablas `compras` y `detalle_compra`
- `compras`: FK a `proveedores` y `usuarios`, enum `estado ('pendiente','recibida','cancelada')`
- `detalle_compra`: campos `numero_lote` y `fecha_vencimiento` opcionales
- **Terminado cuando:** las tablas existen y tienen las FK declaradas.

### T-014 Crear tabla `movimiento_inventario`
- Enum `tipo ('entrada','salida','ajuste')`, FK a `productos` y `usuarios`
- **Terminado cuando:** la tabla acepta los tres tipos de movimiento.

### T-015 Crear tabla `gastos`
- `numero_gasto` UNIQUE, enum `categoria ('servicios','mantenimiento','suministros','otros')`, enum `estado ('registrado','pagado')`
- **Terminado cuando:** la tabla existe con todas las restricciones.

### T-016 Crear tabla `corte_caja`
- Todos los campos decimales de montos con DECIMAL(12,2), enum `estado ('abierto','cerrado')`, índice en `(sucursal_id, fecha)`
- **Terminado cuando:** la tabla existe y se puede insertar un corte completo.

### T-017 Crear tabla `auditoria`
- `datos_antes` y `datos_despues` como columnas `JSONB`, enum `accion ('crear','actualizar','eliminar','consultar')`
- Índice en `(sucursal_id, fecha)` para filtros de reportes
- **Terminado cuando:** la tabla acepta JSONB en los campos de datos y el índice aparece en el schema.

### T-018 Crear índices de performance
- `idx_productos_sucursal_codigo`: `(sucursal_id, codigo)`
- `idx_ventas_sucursal_fecha`: `(sucursal_id, fecha)`
- `idx_movimiento_producto`: `(producto_id, fecha)`
- `idx_auditoria_usuario_fecha`: `(usuario_id, fecha)`
- **Terminado cuando:** `EXPLAIN ANALYZE` en una query de búsqueda de producto por código usa el índice.

---

## FASE 2 — Autenticación y Middleware

### T-019 Implementar `auth.middleware.js`
- Extrae el JWT del header `Authorization: Bearer <token>`
- Verifica el token con Supabase Auth (`supabase.auth.getUser(token)`)
- Adjunta `req.user = { id, email, role, empresa_id, sucursal_id }` para uso en controladores
- Retorna `401` si el token es inválido o ausente
- **Terminado cuando:** una ruta protegida con el middleware devuelve `401` sin token y `200` con token válido.

### T-020 Implementar `rbac.middleware.js`
- Exportar función `allowRoles(...roles)` que devuelve un middleware
- Si `req.user.role` no está en `roles`, retorna `403 { error: 'Acceso denegado' }`
- **Terminado cuando:** una ruta configurada con `allowRoles('gerente','administrador')` rechaza a un usuario con rol `vendedor`.

### T-021 Implementar `validate.middleware.js`
- Exportar función `validate(schema)` que aplica `schema.safeParse(req.body)`
- Si falla, retorna `422` con lista de errores de Zod `{ field, message }`
- Si pasa, llama `next()`
- **Terminado cuando:** un body con campo requerido faltante devuelve `422` con el nombre del campo en el error.

### T-022 Implementar `error.middleware.js`
- Manejador global con firma `(err, req, res, next)`
- Distingue: errores de Zod, errores de Supabase (duplicado, FK), AppError propio, y errores genéricos
- En producción no expone stack trace
- **Terminado cuando:** lanzar `throw new Error('test')` en un controlador devuelve `500 { ok: false, error: 'Internal server error' }` sin stack en producción.

### T-023 Implementar `audit.middleware.js`
- Se registra automáticamente después de respuestas exitosas en métodos POST/PUT/PATCH/DELETE
- Inserta en tabla `auditoria`: `usuario_id`, `accion`, `tabla_afectada`, `registro_id`, `ip_address`, `fecha`
- **Terminado cuando:** crear un producto genera automáticamente una fila en `auditoria` con `accion = 'crear'` y `tabla_afectada = 'productos'`.

### T-024 Endpoint `POST /api/v1/auth/login`
- Llama a `supabase.auth.signInWithPassword({ email, password })`
- Retorna `{ token, user: { id, nombre, rol, empresa_id, sucursal_id } }`
- Registra el intento fallido; después de 3 intentos fallidos retorna `429 { error: 'Cuenta bloqueada' }` (Supabase Auth maneja esto nativamente)
- **Terminado cuando:** credenciales correctas devuelven token JWT válido; incorrectas devuelven `400`.

### T-025 Endpoint `POST /api/v1/auth/logout`
- Llama a `supabase.auth.signOut()` con el token del usuario
- Retorna `200 { ok: true }`
- **Terminado cuando:** el token queda invalidado y no puede usarse en rutas protegidas después del logout.

### T-026 Endpoint `POST /api/v1/auth/forgot-password`
- Llama a `supabase.auth.resetPasswordForEmail(email)`
- Siempre retorna `200` (no confirma si el correo existe, por seguridad)
- **Terminado cuando:** un correo registrado recibe el email de recuperación de Supabase.

### T-027 Endpoint `GET /api/v1/auth/me`
- Ruta protegida con `auth.middleware`
- Retorna los datos del usuario autenticado desde la tabla `usuarios`
- **Terminado cuando:** con token válido devuelve los datos del usuario; sin token devuelve `401`.

---

## FASE 3 — Módulo de Categorías

### T-028 Esquema Zod para categoría
- Crear `src/schemas/category.schema.js` con campos: `nombre` (string, min 1, max 100), `descripcion` (string opcional)
- **Terminado cuando:** `schema.safeParse({ nombre: '' })` retorna `success: false`.

### T-029 Endpoints CRUD de categorías
- `GET /api/v1/categories` — lista categorías activas de la sucursal del usuario
- `POST /api/v1/categories` — crea categoría (roles: gerente, administrador)
- `PUT /api/v1/categories/:id` — actualiza nombre/descripción
- `DELETE /api/v1/categories/:id` — elimina si no tiene productos asociados, si tiene retorna `409`
- **Terminado cuando:** los 4 endpoints responden correctamente y el DELETE retorna `409` si hay productos en la categoría.

---

## FASE 4 — Módulo de Productos

### T-030 Esquema Zod para producto
- Crear `src/schemas/product.schema.js` con: `codigo` (string, max 50), `nombre` (string, min 1, max 200), `descripcion` (opcional), `categoria_id` (number), `precio_venta` (number, positivo), `costo_unitario` (number, positivo), `stock_actual` (number, ≥ 0), `stock_minimo` (number, ≥ 0)
- **Terminado cuando:** `schema.safeParse({ codigo: '', precio_venta: -1 })` retorna `success: false` con errores en ambos campos.

### T-031 `GET /api/v1/products` — listar productos
- Filtra por `sucursal_id` del usuario autenticado y `estado = 'activo'`
- Soporta query params: `?search=`, `?categoria_id=`, `?low_stock=true`, `?page=`, `?limit=`
- Retorna paginación: `{ data, total, page, limit }`
- **Terminado cuando:** `?low_stock=true` solo devuelve productos donde `stock_actual <= stock_minimo`.

### T-032 `GET /api/v1/products/:id` — obtener producto por ID
- Retorna `404` si no existe o pertenece a otra sucursal
- **Terminado cuando:** ID inexistente devuelve `404 { error: 'Producto no encontrado' }`.

### T-033 `GET /api/v1/products/by-code/:codigo` — buscar por código
- Usada en la pantalla de ventas para escaneo rápido
- Retorna `404` si no existe o está inactivo
- **Terminado cuando:** el endpoint devuelve el producto en < 200ms con índice activo.

### T-034 `POST /api/v1/products` — crear producto
- Roles permitidos: gerente, administrador
- Valida unicidad de `codigo` dentro de la sucursal antes de insertar
- Retorna `409` si el código ya existe
- **Terminado cuando:** crear con código duplicado devuelve `409`; con datos válidos devuelve `201` con el producto creado.

### T-035 `PUT /api/v1/products/:id` — actualizar producto
- El campo `codigo` es inmutable (se ignora si se envía)
- Solo permite actualizar: `nombre`, `descripcion`, `categoria_id`, `precio_venta`, `costo_unitario`, `stock_minimo`
- El `stock_actual` no se modifica por este endpoint (se gestiona por inventario)
- **Terminado cuando:** enviar un body con `codigo` distinto no cambia el código en BD.

### T-036 `DELETE /api/v1/products/:id` — eliminar producto (soft delete)
- Solo rol administrador
- Si tiene `detalle_venta` asociados, retorna `409 { error: 'Producto con historial de ventas' }`
- Si no tiene historial, cambia `estado = 'inactivo'`
- **Terminado cuando:** eliminar un producto con ventas devuelve `409`; sin ventas cambia el estado y desaparece de `/api/v1/products`.

---

## FASE 5 — Módulo de Ventas

### T-037 Esquema Zod para venta
- Crear `src/schemas/sale.schema.js`
- `forma_pago`: enum `('efectivo','tarjeta','cheque','transferencia')`
- `items`: array no vacío de `{ producto_id, cantidad (>0), precio_unitario (>0) }`
- `descuento`: número entre 0 y 100 (porcentaje), opcional
- `monto_recibido`: requerido si `forma_pago = 'efectivo'`
- **Terminado cuando:** array de items vacío devuelve error de validación.

### T-038 `POST /api/v1/sales` — crear venta
- Roles: vendedor, gerente, administrador
- Dentro de una transacción de BD:
  1. Verifica que cada producto tiene stock suficiente; si falta, retorna `409 { error: 'Stock insuficiente', producto_id, disponible }`
  2. Calcula `subtotal`, aplica descuento (máx 50% si es vendedor), calcula impuesto según configuración
  3. Inserta en `ventas` y en `detalle_venta`
  4. Descuenta `stock_actual` de cada producto
  5. Inserta un `movimiento_inventario` de tipo `salida` por cada ítem
- Retorna `201` con la venta completa incluyendo número de transacción generado
- **Terminado cuando:** crear una venta descuenta correctamente el stock y una venta con stock insuficiente retorna `409` sin modificar nada en BD.

### T-039 `GET /api/v1/sales` — listar ventas
- Filtra por `sucursal_id` del usuario, soporta: `?fecha_inicio=`, `?fecha_fin=`, `?usuario_id=`, `?forma_pago=`, `?estado=`
- Pagina los resultados
- **Terminado cuando:** filtrar por `fecha_inicio` y `fecha_fin` devuelve solo ventas en ese rango.

### T-040 `GET /api/v1/sales/:id` — obtener venta con detalle
- Incluye: datos de venta + array de ítems con nombre y código del producto
- **Terminado cuando:** la respuesta contiene el campo `items` con al menos `producto_id`, `nombre`, `cantidad`, `precio_unitario`, `subtotal`.

### T-041 `POST /api/v1/sales/:id/cancel` — anular venta
- Roles: gerente, administrador
- Valida que la venta sea del mismo día (< 24 horas desde `fecha`)
- Valida que `estado != 'anulada'`
- Requiere campo `motivo` en el body
- Dentro de transacción: cambia `estado = 'anulada'` y restaura `stock_actual` de cada producto
- Inserta `movimiento_inventario` de tipo `entrada` para cada ítem restaurado
- **Terminado cuando:** anular una venta restaura el stock; intentar anular una venta de más de 24 horas retorna `422`.

### T-042 `POST /api/v1/sales/:id/receipt` — datos del comprobante
- Retorna estructura lista para renderizar el comprobante: datos del negocio, número de transacción, fecha, ítem por ítem, totales, forma de pago, vuelto si aplica
- **Terminado cuando:** la respuesta incluye todos los campos necesarios para imprimir el ticket sin llamadas adicionales.

---

## FASE 6 — Módulo de Inventario

### T-043 Esquema Zod para movimiento de inventario
- Crear `src/schemas/inventory.schema.js`
- `tipo`: enum `('entrada','salida','ajuste')`
- `cantidad`: number > 0
- `motivo`: string, min 5 caracteres
- `producto_id`: number requerido
- **Terminado cuando:** `motivo` vacío devuelve error de validación.

### T-044 `POST /api/v1/inventory/movements` — registrar movimiento manual
- Roles para `salida`/`ajuste`: vendedor, gerente, administrador (con restricción de negocio: donaciones y devoluciones quedan en estado `pendiente` si el rol es vendedor)
- Valida que `cantidad` no exceda el stock si `tipo = 'salida'`
- Actualiza `stock_actual` en `productos`
- Inserta en `movimiento_inventario`
- **Terminado cuando:** una salida mayor al stock disponible retorna `409`; una salida válida actualiza el stock correctamente.

### T-045 `GET /api/v1/inventory/movements` — listar movimientos
- Filtra por: `producto_id`, `tipo`, `fecha_inicio`, `fecha_fin`
- Pagina los resultados
- **Terminado cuando:** filtrar por `tipo=entrada` solo devuelve movimientos de tipo entrada.

### T-046 `GET /api/v1/inventory/low-stock` — productos con stock bajo
- Retorna productos donde `stock_actual <= stock_minimo` de la sucursal del usuario
- **Terminado cuando:** el endpoint devuelve solo los productos en alerta y la respuesta incluye `stock_actual` y `stock_minimo`.

---

## FASE 7 — Módulo de Compras

### T-047 Esquema Zod para compra
- Crear `src/schemas/purchase.schema.js`
- `proveedor_id`: number requerido
- `items`: array no vacío de `{ producto_id, cantidad (>0), costo_unitario (>0), numero_lote?, fecha_vencimiento? }`
- `observaciones`: string opcional
- **Terminado cuando:** items vacío devuelve error de validación.

### T-048 `POST /api/v1/purchases` — registrar compra (entrada de stock)
- Roles: gerente, administrador
- Dentro de transacción:
  1. Inserta en `compras` con `estado = 'recibida'`
  2. Inserta en `detalle_compra`
  3. Incrementa `stock_actual` de cada producto
  4. Inserta `movimiento_inventario` de tipo `entrada` por cada ítem, referenciando el número de compra
- **Terminado cuando:** crear una compra incrementa el stock de los productos involucrados y crea los movimientos de inventario correspondientes.

### T-049 `GET /api/v1/purchases` y `GET /api/v1/purchases/:id`
- Lista con filtros: `proveedor_id`, `fecha_inicio`, `fecha_fin`, `estado`
- Detalle incluye los ítems de la compra
- **Terminado cuando:** ambos endpoints responden correctamente.

### T-050 Endpoints CRUD de proveedores
- `GET /api/v1/suppliers` — lista proveedores activos de la sucursal
- `POST /api/v1/suppliers` — crea proveedor (gerente, administrador)
- `PUT /api/v1/suppliers/:id` — actualiza datos del proveedor
- `DELETE /api/v1/suppliers/:id` — soft delete (marca `estado = 'inactivo'`)
- **Terminado cuando:** los 4 endpoints responden correctamente y el DELETE no elimina físicamente el registro.

---

## FASE 8 — Módulo de Cierre de Caja

### T-051 Esquema Zod para cierre de caja
- Crear `src/schemas/cashclose.schema.js`
- `total_efectivo_contado`: number ≥ 0
- `observaciones`: string opcional
- **Terminado cuando:** `total_efectivo_contado` negativo devuelve error de validación.

### T-052 `POST /api/v1/cashclose` — crear cierre de caja
- Roles: gerente, administrador
- Valida que no exista ya un cierre `cerrado` para la sucursal en el mismo día
- Calcula automáticamente: `total_ventas`, `total_efectivo_esperado`, `total_tarjeta`, `total_cheque`, `total_transferencia`, `total_general` sumando ventas del día con `estado = 'completada'`
- Calcula `diferencia_efectivo = total_efectivo_contado - total_efectivo_esperado`
- Cambia `estado = 'cerrado'`
- **Terminado cuando:** el cierre calcula correctamente los totales coincidentes con las ventas del día; intentar hacer un segundo cierre el mismo día devuelve `409`.

### T-053 `GET /api/v1/cashclose` — historial de cierres
- Filtra por `fecha_inicio`, `fecha_fin`
- Pagina los resultados
- **Terminado cuando:** el endpoint lista los cierres y cada entrada incluye `diferencia_efectivo`.

### T-054 `GET /api/v1/cashclose/:id` — detalle de cierre
- Incluye desglose completo por forma de pago
- **Terminado cuando:** la respuesta incluye `total_efectivo_esperado`, `total_efectivo_contado` y `diferencia_efectivo`.

---

## FASE 9 — Módulo de Reportes

### T-055 `GET /api/v1/reports/sales` — reporte de ventas
- Params: `fecha_inicio` (requerido), `fecha_fin` (requerido), `usuario_id?`, `forma_pago?`
- Retorna: `total_transacciones`, `total_ventas`, `promedio_transaccion`, `desglose_por_forma_pago`, `desglose_por_vendedor`
- **Terminado cuando:** el reporte con `fecha_inicio = fecha_fin` devuelve solo las ventas de ese día.

### T-056 `GET /api/v1/reports/sales/by-product` — ventas por producto
- Params: `fecha_inicio`, `fecha_fin`
- Retorna tabla: `codigo`, `nombre`, `cantidad_vendida`, `ingresos`, `costo_total`, `ganancia`
- Ordenado por `ingresos DESC`
- **Terminado cuando:** el reporte incluye la ganancia por producto calculada como `ingresos - costo_total`.

### T-057 `GET /api/v1/reports/inventory` — reporte de inventario
- Params: `categoria_id?`, `estado?`, `order_by?` (por ejemplo `stock_actual`)
- Retorna: `codigo`, `nombre`, `stock_actual`, `costo_unitario`, `valor_total_stock`, `estado`
- **Terminado cuando:** filtrar por `categoria_id` solo devuelve productos de esa categoría y el `valor_total_stock` es `stock_actual * costo_unitario`.

### T-058 `GET /api/v1/reports/profit` — reporte de ganancias
- Params: `fecha_inicio`, `fecha_fin`
- Retorna: `ingresos_totales`, `costo_productos_vendidos`, `ganancia_bruta`, `margen_porcentaje`, `desglose_por_categoria`
- Retorna mensaje `{ sin_datos: true }` si no hay transacciones en el período
- **Terminado cuando:** el `margen_porcentaje` se calcula como `(ganancia_bruta / ingresos_totales) * 100` y se retorna redondeado a 2 decimales.

---

## FASE 10 — Módulo de Gastos

### T-059 Esquema Zod para gasto
- Crear `src/schemas/expense.schema.js`
- `categoria`: enum `('servicios','mantenimiento','suministros','otros')`
- `monto`: number > 0
- `descripcion`: string, min 5
- `fecha`: string ISO date
- **Terminado cuando:** `monto = 0` devuelve error de validación.

### T-060 Endpoints CRUD de gastos
- `GET /api/v1/expenses` — lista gastos de la sucursal, filtra por `categoria`, `fecha_inicio`, `fecha_fin`, `estado`
- `POST /api/v1/expenses` — crea gasto (gerente, administrador)
- `PUT /api/v1/expenses/:id` — actualiza gasto (solo si `estado = 'registrado'`)
- `PATCH /api/v1/expenses/:id/pay` — cambia `estado = 'pagado'`
- **Terminado cuando:** intentar editar un gasto con `estado = 'pagado'` devuelve `422`.

---

## FASE 11 — Módulo de Usuarios y Configuración

### T-061 Esquema Zod para usuario
- Crear `src/schemas/user.schema.js`
- `nombre`: string, min 2
- `correo`: string email válido
- `rol`: enum `('vendedor','gerente','administrador')`
- `password`: string, min 8 (solo en creación)
- **Terminado cuando:** correo con formato inválido devuelve error de validación.

### T-062 `GET /api/v1/users` — listar usuarios
- Solo rol administrador
- Filtra por `sucursal_id` del admin, soporta `?estado=`
- **Terminado cuando:** un usuario con rol `gerente` recibe `403`.

### T-063 `POST /api/v1/users` — crear usuario
- Solo rol administrador
- Crea el usuario en Supabase Auth con `supabase.auth.admin.createUser()` y luego inserta en tabla `usuarios`
- Si `supabase.auth.admin.createUser()` falla por correo duplicado, retorna `409 { error: 'Correo ya existe' }`
- **Terminado cuando:** crear un usuario con correo duplicado devuelve `409`; crear con datos válidos inserta en ambos sistemas.

### T-064 `PUT /api/v1/users/:id` — actualizar usuario
- Solo rol administrador
- Permite cambiar: `nombre`, `rol`, `sucursal_id`
- No permite cambiar `correo` ni `contraseña` por este endpoint
- **Terminado cuando:** enviar un body con `correo` distinto no actualiza el correo en BD.

### T-065 `PATCH /api/v1/users/:id/status` — activar/desactivar usuario
- Solo rol administrador
- Cambia `estado` entre `activo` e `inactivo`
- Si se desactiva, también llama `supabase.auth.admin.updateUserById(id, { ban_duration: 'none' })` para bloquear acceso
- **Terminado cuando:** desactivar un usuario le impide iniciar sesión.

### T-066 Endpoints de configuración del negocio
- `GET /api/v1/settings` — retorna configuración de la empresa del usuario
- `PUT /api/v1/settings` — actualiza: `nombre`, `ruc_nit`, `telefono`, `direccion`, `porcentaje_iva`
- Solo rol administrador puede hacer PUT
- **Terminado cuando:** actualizar el `porcentaje_iva` afecta el cálculo de impuesto en las nuevas ventas.

---

## FASE 12 — Módulo de Auditoría

### T-067 `GET /api/v1/audit` — consultar registros de auditoría
- Solo rol administrador
- Filtra por: `usuario_id`, `accion`, `tabla_afectada`, `fecha_inicio`, `fecha_fin`
- Pagina los resultados (máx 100 por página)
- **Terminado cuando:** filtrar por `accion=eliminar` solo devuelve registros con esa acción.

### T-068 `GET /api/v1/audit/:id` — detalle de registro de auditoría
- Retorna el registro completo incluyendo `datos_antes` y `datos_despues` como objetos JSON
- **Terminado cuando:** la respuesta parsea correctamente los campos JSONB como objetos, no como strings.

---

## FASE 13 — Endpoints de Clientes

### T-069 Endpoints CRUD de clientes
- `GET /api/v1/customers` — lista clientes activos de la sucursal
- `POST /api/v1/customers` — crea cliente (todos los roles)
- `PUT /api/v1/customers/:id` — actualiza datos del cliente
- `DELETE /api/v1/customers/:id` — soft delete
- **Terminado cuando:** los 4 endpoints responden correctamente.

---

## FASE 14 — Calidad y Cierre

### T-070 Implementar paginación centralizada
- Crear `src/utils/pagination.js` con función `paginate(query, page, limit)` que aplica `.range()` de Supabase
- Usada en todos los endpoints de listado
- **Terminado cuando:** `?page=2&limit=5` en cualquier endpoint de lista devuelve el segundo bloque de 5 resultados.

### T-071 Validar restricciones de descuento por rol
- En `sales.service.js`, si `req.user.role === 'vendedor'` y `descuento > 50`, retorna `403 { error: 'Descuento excede límite. Requiere aprobación de gerente' }`
- Gerentes no tienen límite de descuento
- **Terminado cuando:** un vendedor que aplica 60% de descuento recibe `403`; un gerente lo acepta.

### T-072 Generación de número de transacción único
- Crear `src/utils/transactionNumber.js` que genera el formato `TXN-YYYYMMDD-NNNN` (con secuencia diaria)
- **Terminado cuando:** dos ventas en el mismo día producen números correlativos distintos; una venta al día siguiente reinicia la secuencia.

### T-073 Documentar todos los endpoints con comentarios JSDoc
- Cada función de controlador tiene: descripción, `@param`, `@returns`, roles permitidos
- **Terminado cuando:** todos los archivos en `src/controllers/` tienen JSDoc en cada función exportada.

### T-074 Pruebas de integración de flujo crítico
- Escribir al menos una prueba de integración (Jest o Vitest) para el flujo: login → crear producto → crear venta → verificar descuento de stock → anular venta → verificar restauración de stock
- **Terminado cuando:** `npm test` pasa sin errores y el flujo completo se ejecuta contra la BD de test de Supabase.

### T-075 Variables de entorno y seguridad final
- Verificar que `SUPABASE_SERVICE_ROLE_KEY` nunca se expone en logs ni en respuestas
- Confirmar que `helmet()` agrega los headers: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`
- **Terminado cuando:** `curl -I http://localhost:3000/api/v1` muestra los tres headers de seguridad.
