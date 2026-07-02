/** @type {import('swagger-ui-express').SwaggerUiOptions} */
const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'ITH-POS — API de Punto de Venta',
    description: [
      'API REST para el sistema de punto de venta del ITH.',
      '',
      '## Autenticación',
      'Todas las rutas (excepto `POST /usuarios/login`) requieren el encabezado:',
      '```',
      'Authorization: Bearer <token>',
      '```',
      'El token se obtiene al iniciar sesión y tiene vigencia de 8 horas.',
      '',
      '## Roles y permisos',
      '| Rol | Acceso |',
      '|-----|--------|',
      '| `vendedor` | Ventas, inventario (lectura), productos (lectura) |',
      '| `gerente` | Todo lo anterior + productos, compras, corte de caja, reportes |',
      '| `administrador` | Acceso total + gestión de usuarios |',
      '',
      '## Envelope de respuesta',
      'Todas las respuestas siguen la misma estructura:',
      '```json',
      '{ "success": true,  "data": { ... } }   // éxito',
      '{ "success": false, "error": "Mensaje" } // error',
      '```',
    ].join('\n'),
    version: '1.0.0',
    contact: { name: 'Soporte ITH-POS', email: 'soporte@ith.edu.mx' },
  },
  servers: [
    { url: 'http://localhost:3001/api', description: 'Desarrollo local' },
  ],
  tags: [
    { name: 'Auth',       description: 'Autenticación e información del usuario activo' },
    { name: 'Usuarios',   description: 'Gestión de usuarios (solo administrador)' },
    { name: 'Productos',  description: 'Catálogo de productos' },
    { name: 'Ventas',     description: 'Registro y consulta de ventas' },
    { name: 'Inventario', description: 'Movimientos y stock bajo' },
    { name: 'Compras',    description: 'Órdenes de compra a proveedores' },
    { name: 'Catálogos',  description: 'Categorías, proveedores, clientes y unidades de medida' },
    { name: 'Corte de Caja', description: 'Cierre diario de caja' },
    { name: 'Reportes',   description: 'Reportes gerenciales (solo gerente y administrador)' },
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // COMPONENTES REUTILIZABLES
  // ─────────────────────────────────────────────────────────────────────────
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Token HMAC-SHA256',
        description: 'Token obtenido en `POST /usuarios/login`',
      },
    },

    schemas: {
      // ── Wrappers de respuesta ──────────────────────────────────────────
      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data:    { description: 'Payload de la respuesta (varía por endpoint)' },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error:   { type: 'string',  example: 'Mensaje de error descriptivo' },
        },
      },

      // ── Usuarios ──────────────────────────────────────────────────────
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    { type: 'string', format: 'email', example: 'admin@ith.edu.mx' },
          password: { type: 'string', minLength: 8,    example: 'MiClave123' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: { $ref: '#/components/schemas/Usuario' },
        },
      },
      Usuario: {
        type: 'object',
        properties: {
          id:         { type: 'integer', example: 1 },
          nombre:     { type: 'string',  example: 'Ana García' },
          email:      { type: 'string',  format: 'email', example: 'ana@ith.edu.mx' },
          rol:        { type: 'string',  enum: ['vendedor', 'gerente', 'administrador'], example: 'gerente' },
          activo:     { type: 'boolean', example: true },
          fecha_creacion: { type: 'string', format: 'date-time' },
        },
      },
      UsuarioCreate: {
        type: 'object',
        required: ['nombre', 'email', 'password'],
        properties: {
          nombre:   { type: 'string', example: 'Carlos López' },
          email:    { type: 'string', format: 'email', example: 'carlos@ith.edu.mx' },
          password: { type: 'string', minLength: 8, example: 'Segura2024!' },
          rol:      { type: 'string', enum: ['vendedor', 'gerente', 'administrador'], default: 'vendedor' },
        },
      },

      // ── Productos ─────────────────────────────────────────────────────
      Producto: {
        type: 'object',
        properties: {
          id:               { type: 'integer', example: 5 },
          codigo:           { type: 'string',  example: 'FRU-001' },
          nombre:           { type: 'string',  example: 'Manzana Roja kg' },
          descripcion:      { type: 'string',  example: 'Manzana roja importada' },
          precio_venta:     { type: 'number',  example: 32.50 },
          costo_unitario:   { type: 'number',  example: 18.00 },
          stock_actual:     { type: 'number',  example: 47.5 },
          stock_minimo:     { type: 'number',  example: 10 },
          categoria_id:     { type: 'integer', example: 2 },
          estado:           { type: 'string',  enum: ['activo', 'inactivo'], example: 'activo' },
          fecha_creacion:   { type: 'string',  format: 'date-time' },
          fecha_actualizacion: { type: 'string', format: 'date-time' },
        },
      },
      ProductoCreate: {
        type: 'object',
        required: ['codigo', 'nombre', 'precio_venta'],
        properties: {
          codigo:         { type: 'string',  example: 'FRU-001' },
          nombre:         { type: 'string',  example: 'Manzana Roja kg' },
          descripcion:    { type: 'string',  example: 'Manzana roja importada' },
          precio_venta:   { type: 'number',  example: 32.50 },
          costo_unitario: { type: 'number',  example: 18.00 },
          stock_actual:   { type: 'number',  example: 0 },
          stock_minimo:   { type: 'number',  example: 10 },
          categoria_id:   { type: 'integer', example: 2 },
        },
      },

      // ── Ventas ────────────────────────────────────────────────────────
      ItemVenta: {
        type: 'object',
        required: ['id_producto', 'cantidad', 'precio_unitario'],
        properties: {
          id_producto:     { type: 'integer', example: 5 },
          cantidad:        { type: 'number',  example: 3 },
          precio_unitario: { type: 'number',  example: 32.50 },
          descuento:       { type: 'number',  example: 0, default: 0, description: 'Descuento por línea en pesos' },
        },
      },
      VentaCreate: {
        type: 'object',
        required: ['items', 'metodo_pago'],
        properties: {
          items:           { type: 'array', items: { $ref: '#/components/schemas/ItemVenta' }, minItems: 1 },
          metodo_pago:     { type: 'string', enum: ['efectivo', 'tarjeta', 'transferencia'], example: 'efectivo' },
          monto_pagado:    { type: 'number', example: 200.00, description: 'Requerido cuando metodo_pago es efectivo' },
          descuento_global: { type: 'number', example: 0, default: 0, description: 'Descuento sobre el total en pesos' },
          id_cliente:      { type: 'integer', example: 1, description: 'Opcional' },
          notas:           { type: 'string',  example: 'Cliente frecuente' },
        },
      },
      DetalleVenta: {
        type: 'object',
        properties: {
          id:              { type: 'integer', example: 12 },
          id_producto:     { type: 'integer', example: 5 },
          cantidad:        { type: 'number',  example: 3 },
          precio_unitario: { type: 'number',  example: 32.50 },
          descuento:       { type: 'number',  example: 0 },
          subtotal:        { type: 'number',  example: 97.50 },
        },
      },
      Venta: {
        type: 'object',
        properties: {
          id:              { type: 'integer', example: 42 },
          folio:           { type: 'string',  example: 'VTA-260702-0001' },
          fecha:           { type: 'string',  format: 'date', example: '2026-07-02' },
          subtotal:        { type: 'number',  example: 97.50 },
          descuento:       { type: 'number',  example: 0 },
          impuestos:       { type: 'number',  example: 15.60 },
          total:           { type: 'number',  example: 113.10 },
          metodo_pago:     { type: 'string',  example: 'efectivo' },
          monto_pagado:    { type: 'number',  example: 200.00 },
          cambio:          { type: 'number',  example: 86.90 },
          estado:          { type: 'string',  enum: ['completada', 'cancelada'], example: 'completada' },
          id_usuario:      { type: 'integer', example: 2 },
          detalle:         { type: 'array',   items: { $ref: '#/components/schemas/DetalleVenta' } },
        },
      },

      // ── Inventario ────────────────────────────────────────────────────
      MovimientoCreate: {
        type: 'object',
        required: ['id_producto', 'tipo', 'cantidad', 'motivo'],
        properties: {
          id_producto: { type: 'integer', example: 5 },
          tipo:        { type: 'string',  enum: ['entrada', 'salida', 'ajuste'], example: 'entrada' },
          cantidad:    { type: 'number',  example: 20 },
          motivo:      { type: 'string',  example: 'Reposición semanal' },
        },
      },
      MovimientoInventario: {
        type: 'object',
        properties: {
          id:          { type: 'integer', example: 8 },
          id_producto: { type: 'integer', example: 5 },
          tipo:        { type: 'string',  example: 'entrada' },
          cantidad:    { type: 'number',  example: 20 },
          motivo:      { type: 'string',  example: 'Reposición semanal' },
          stock_antes: { type: 'number',  example: 27.5 },
          stock_despues: { type: 'number', example: 47.5 },
          fecha:       { type: 'string',  format: 'date-time' },
        },
      },

      // ── Compras ───────────────────────────────────────────────────────
      ItemCompra: {
        type: 'object',
        required: ['id_producto', 'cantidad', 'precio_unitario'],
        properties: {
          id_producto:     { type: 'integer', example: 5 },
          cantidad:        { type: 'number',  example: 50 },
          precio_unitario: { type: 'number',  example: 18.00 },
        },
      },
      CompraCreate: {
        type: 'object',
        required: ['id_proveedor', 'items'],
        properties: {
          id_proveedor: { type: 'integer', example: 1 },
          items:        { type: 'array', items: { $ref: '#/components/schemas/ItemCompra' }, minItems: 1 },
          notas:        { type: 'string',  example: 'Pedido mensual de frutas' },
        },
      },
      Compra: {
        type: 'object',
        properties: {
          id:           { type: 'integer', example: 7 },
          id_proveedor: { type: 'integer', example: 1 },
          total:        { type: 'number',  example: 900.00 },
          estado:       { type: 'string',  enum: ['pendiente', 'recibida', 'cancelada'], example: 'recibida' },
          fecha:        { type: 'string',  format: 'date-time' },
          notas:        { type: 'string',  example: 'Pedido mensual de frutas' },
        },
      },

      // ── Catálogos ─────────────────────────────────────────────────────
      Categoria: {
        type: 'object',
        properties: {
          id:     { type: 'integer', example: 2 },
          nombre: { type: 'string',  example: 'Frutas y verduras' },
        },
      },
      Proveedor: {
        type: 'object',
        properties: {
          id:        { type: 'integer', example: 1 },
          nombre:    { type: 'string',  example: 'Distribuidora del Norte SA' },
          contacto:  { type: 'string',  example: 'Lic. Pedro Ramírez' },
          telefono:  { type: 'string',  example: '618-555-0100' },
          email:     { type: 'string',  format: 'email', example: 'ventas@distrinorte.mx' },
          direccion: { type: 'string',  example: 'Calle Industrial 400, Durango' },
        },
      },
      Cliente: {
        type: 'object',
        properties: {
          id:       { type: 'integer', example: 3 },
          nombre:   { type: 'string',  example: 'María González' },
          telefono: { type: 'string',  example: '618-555-0200' },
          email:    { type: 'string',  format: 'email', example: 'maria@correo.com' },
          rfc:      { type: 'string',  example: 'GOMA801201AB3' },
        },
      },

      // ── Corte de Caja ─────────────────────────────────────────────────
      CorteCajaPreview: {
        type: 'object',
        properties: {
          total_ventas:        { type: 'number', example: 3450.00 },
          efectivo_esperado:   { type: 'number', example: 1800.00 },
          total_tarjeta:       { type: 'number', example: 1200.00 },
          total_transferencia: { type: 'number', example: 450.00 },
          total_otros:         { type: 'number', example: 0 },
        },
      },
      CorteCajaCreate: {
        type: 'object',
        required: ['efectivo_contado'],
        properties: {
          efectivo_contado: { type: 'number', example: 1850.00 },
          fecha:  { type: 'string', format: 'date', example: '2026-07-02', description: 'Defecto: hoy' },
          notas:  { type: 'string', example: 'Sin novedades' },
        },
      },
      CorteCaja: {
        type: 'object',
        properties: {
          id:                  { type: 'integer', example: 15 },
          fecha:               { type: 'string',  format: 'date', example: '2026-07-02' },
          total_ventas:        { type: 'number',  example: 3450.00 },
          efectivo_esperado:   { type: 'number',  example: 1800.00 },
          efectivo_contado:    { type: 'number',  example: 1850.00 },
          diferencia:          { type: 'number',  example: 50.00, description: 'Positivo = sobrante, negativo = faltante' },
          total_tarjeta:       { type: 'number',  example: 1200.00 },
          total_transferencia: { type: 'number',  example: 450.00 },
          estado:              { type: 'string',  enum: ['cerrado'], example: 'cerrado' },
          notas:               { type: 'string',  example: 'Sin novedades' },
          id_usuario:          { type: 'integer', example: 2 },
        },
      },
    },

    // ── Respuestas de error reutilizables ────────────────────────────────
    responses: {
      Unauthorized: {
        description: 'Token ausente o inválido',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' }, example: { success: false, error: 'Token inválido o expirado' } } },
      },
      Forbidden: {
        description: 'El rol del usuario no tiene permiso para esta acción',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' }, example: { success: false, error: 'No tienes permisos para realizar esta acción' } } },
      },
      NotFound: {
        description: 'Recurso no encontrado',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' }, example: { success: false, error: 'Recurso no encontrado' } } },
      },
      Conflict: {
        description: 'Conflicto de datos (duplicado o estado inválido)',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' }, example: { success: false, error: 'El recurso ya existe o está en un estado que impide la operación' } } },
      },
      BadRequest: {
        description: 'Parámetros de entrada inválidos',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' }, example: { success: false, error: 'Descripción del campo inválido' } } },
      },
      ServerError: {
        description: 'Error interno del servidor',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' }, example: { success: false, error: 'Error interno del servidor' } } },
      },
    },

    // ── Parámetros reutilizables ─────────────────────────────────────────
    parameters: {
      IdPath: {
        name: 'id', in: 'path', required: true,
        schema: { type: 'integer', example: 1 },
        description: 'ID numérico del recurso',
      },
      FechaDesde: {
        name: 'desde', in: 'query', required: false,
        schema: { type: 'string', format: 'date', example: '2026-07-01' },
        description: 'Fecha de inicio del rango (YYYY-MM-DD)',
      },
      FechaHasta: {
        name: 'hasta', in: 'query', required: false,
        schema: { type: 'string', format: 'date', example: '2026-07-31' },
        description: 'Fecha de fin del rango (YYYY-MM-DD)',
      },
    },
  },

  security: [{ BearerAuth: [] }],

  // ─────────────────────────────────────────────────────────────────────────
  // PATHS
  // ─────────────────────────────────────────────────────────────────────────
  paths: {

    // ═══════════════════════════════════════════════════════════════════════
    // AUTENTICACIÓN Y USUARIOS
    // ═══════════════════════════════════════════════════════════════════════
    '/usuarios/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        description: 'Valida las credenciales y devuelve un token de acceso. Esta ruta es **pública** — no requiere Authorization.',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          200: {
            description: 'Credenciales válidas — token generado',
            content: {
              'application/json': {
                schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/LoginResponse' } } }] },
                example: { success: true, data: { token: 'abc123...', user: { id: 1, nombre: 'Ana García', rol: 'administrador' } } },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { description: 'Contraseña incorrecta', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' }, example: { success: false, error: 'Credenciales inválidas' } } } },
          404: { description: 'Usuario no existe', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
        },
      },
    },

    '/usuarios/me': {
      get: {
        tags: ['Auth'],
        summary: 'Perfil del usuario autenticado',
        description: 'Devuelve los datos del usuario asociado al token enviado en el encabezado.',
        responses: {
          200: {
            description: 'Datos del usuario actual',
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/Usuario' } } }] } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/usuarios': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar usuarios',
        description: 'Retorna todos los usuarios registrados. **Requiere rol administrador.**',
        parameters: [
          { name: 'rol', in: 'query', schema: { type: 'string', enum: ['vendedor', 'gerente', 'administrador'] }, description: 'Filtrar por rol' },
          { name: 'activo', in: 'query', schema: { type: 'boolean' }, description: 'Filtrar por estado (true/false)' },
        ],
        responses: {
          200: { description: 'Lista de usuarios', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Usuario' } } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Usuarios'],
        summary: 'Crear usuario',
        description: 'Registra un nuevo usuario en el sistema. **Requiere rol administrador.**',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UsuarioCreate' } } } },
        responses: {
          201: { description: 'Usuario creado', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/Usuario' } } }] } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },

    '/usuarios/{id}': {
      get: {
        tags: ['Usuarios'],
        summary: 'Obtener usuario por ID',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: {
          200: { description: 'Datos del usuario', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/Usuario' } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Usuarios'],
        summary: 'Actualizar usuario',
        description: 'Modifica nombre, email o rol. **Requiere rol administrador.**',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { nombre: { type: 'string' }, email: { type: 'string', format: 'email' }, rol: { type: 'string', enum: ['vendedor', 'gerente', 'administrador'] } } },
              example: { nombre: 'Ana García', rol: 'gerente' },
            },
          },
        },
        responses: {
          200: { description: 'Usuario actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/usuarios/{id}/password': {
      patch: {
        tags: ['Usuarios'],
        summary: 'Cambiar contraseña',
        description: 'Actualiza la contraseña del usuario. **Requiere rol administrador.**',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['password'], properties: { password: { type: 'string', minLength: 8, example: 'NuevaClave2024!' } } } } },
        },
        responses: {
          200: { description: 'Contraseña actualizada', content: { 'application/json': { example: { success: true, data: { message: 'Contraseña actualizada correctamente' } } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/usuarios/{id}/status': {
      patch: {
        tags: ['Usuarios'],
        summary: 'Activar / desactivar usuario',
        description: 'Cambia el estado activo del usuario. **Requiere rol administrador.**',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['activo'], properties: { activo: { type: 'boolean', example: false } } } } },
        },
        responses: {
          200: { description: 'Estado actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PRODUCTOS
    // ═══════════════════════════════════════════════════════════════════════
    '/productos': {
      get: {
        tags: ['Productos'],
        summary: 'Listar productos',
        description: 'Devuelve el catálogo de productos con filtros opcionales.',
        parameters: [
          { name: 'search',    in: 'query', schema: { type: 'string' }, description: 'Buscar por nombre o código', example: 'manzana' },
          { name: 'categoria', in: 'query', schema: { type: 'integer' }, description: 'Filtrar por ID de categoría', example: 2 },
          { name: 'low_stock', in: 'query', schema: { type: 'boolean' }, description: 'Solo productos con stock ≤ stock_minimo' },
        ],
        responses: {
          200: { description: 'Lista de productos', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Producto' } } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Productos'],
        summary: 'Crear producto',
        description: '**Requiere rol gerente o administrador.**',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductoCreate' } } } },
        responses: {
          201: { description: 'Producto creado', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/Producto' } } }] } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { description: 'El código de producto ya existe', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' }, example: { success: false, error: 'El código de producto ya existe' } } } },
        },
      },
    },

    '/productos/code/{codigo}': {
      get: {
        tags: ['Productos'],
        summary: 'Buscar producto por código de barras',
        description: 'Útil para lectores de código de barras en la pantalla de ventas.',
        parameters: [{ name: 'codigo', in: 'path', required: true, schema: { type: 'string', example: 'FRU-001' }, description: 'Código único del producto' }],
        responses: {
          200: { description: 'Producto encontrado', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/Producto' } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/productos/{id}': {
      get: {
        tags: ['Productos'],
        summary: 'Obtener producto por ID',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: {
          200: { description: 'Datos del producto', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/Producto' } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Productos'],
        summary: 'Actualizar producto',
        description: '**Requiere rol gerente o administrador.**',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductoCreate' } } } },
        responses: {
          200: { description: 'Producto actualizado', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/Producto' } } }] } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Productos'],
        summary: 'Desactivar producto',
        description: 'Marca el producto como inactivo (soft-delete). **Requiere rol administrador.**',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: {
          200: { description: 'Producto desactivado', content: { 'application/json': { example: { success: true, data: { message: 'Producto desactivado correctamente' } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // VENTAS
    // ═══════════════════════════════════════════════════════════════════════
    '/ventas': {
      get: {
        tags: ['Ventas'],
        summary: 'Listar ventas',
        parameters: [
          { $ref: '#/components/parameters/FechaDesde' },
          { $ref: '#/components/parameters/FechaHasta' },
          { name: 'metodo_pago', in: 'query', schema: { type: 'string', enum: ['efectivo', 'tarjeta', 'transferencia'] }, description: 'Filtrar por método de pago' },
          { name: 'estado',      in: 'query', schema: { type: 'string', enum: ['completada', 'cancelada'] }, description: 'Filtrar por estado' },
          { name: 'cliente',     in: 'query', schema: { type: 'integer' }, description: 'Filtrar por ID de cliente' },
        ],
        responses: {
          200: { description: 'Lista de ventas', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Venta' } } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Ventas'],
        summary: 'Registrar venta',
        description: 'Crea una nueva venta, decrementa el stock de cada producto y registra el movimiento de inventario. Disponible para todos los roles autenticados.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VentaCreate' },
              example: {
                items: [
                  { id_producto: 5, cantidad: 2, precio_unitario: 32.50, descuento: 0 },
                  { id_producto: 8, cantidad: 1, precio_unitario: 15.00, descuento: 0 },
                ],
                metodo_pago: 'efectivo',
                monto_pagado: 200,
                descuento_global: 0,
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Venta registrada',
            content: {
              'application/json': {
                schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/Venta' } } }] },
                example: { success: true, data: { id: 42, folio: 'VTA-260702-0001', total: 92.80, cambio: 107.20, estado: 'completada' } },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          409: { description: 'Stock insuficiente para uno o más productos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' }, example: { success: false, error: 'Stock insuficiente para "Manzana Roja kg". Disponible: 3' } } } },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },

    '/ventas/{id}': {
      get: {
        tags: ['Ventas'],
        summary: 'Obtener venta con detalle',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: {
          200: { description: 'Venta con líneas de detalle', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/Venta' } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/ventas/{id}/cancelar': {
      patch: {
        tags: ['Ventas'],
        summary: 'Cancelar venta',
        description: 'Cancela la venta y restaura el stock de los productos. **Requiere rol gerente o administrador.**',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['motivo'], properties: { motivo: { type: 'string', minLength: 5, example: 'Error en el cobro — cliente no autorizó el cargo' } } } } },
        },
        responses: {
          200: { description: 'Venta cancelada y stock restaurado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // INVENTARIO
    // ═══════════════════════════════════════════════════════════════════════
    '/inventario/movements': {
      get: {
        tags: ['Inventario'],
        summary: 'Listar movimientos de inventario',
        parameters: [
          { name: 'id_producto', in: 'query', schema: { type: 'integer' }, description: 'Filtrar por producto' },
          { name: 'tipo', in: 'query', schema: { type: 'string', enum: ['entrada', 'salida', 'ajuste', 'venta', 'compra'] }, description: 'Filtrar por tipo de movimiento' },
          { $ref: '#/components/parameters/FechaDesde' },
          { $ref: '#/components/parameters/FechaHasta' },
        ],
        responses: {
          200: { description: 'Lista de movimientos', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/MovimientoInventario' } } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Inventario'],
        summary: 'Registrar movimiento manual',
        description: 'Registra una entrada, salida o ajuste de inventario. Actualiza el stock del producto.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MovimientoCreate' } } } },
        responses: {
          201: { description: 'Movimiento registrado', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/MovimientoInventario' } } }] } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/inventario/low-stock': {
      get: {
        tags: ['Inventario'],
        summary: 'Productos con stock bajo',
        description: 'Devuelve todos los productos cuyo `stock_actual` es menor o igual a `stock_minimo`.',
        responses: {
          200: {
            description: 'Productos con stock bajo',
            content: {
              'application/json': {
                schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Producto' } } } }] },
                example: { success: true, data: [{ id: 5, nombre: 'Manzana Roja kg', stock_actual: 3, stock_minimo: 10 }] },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // COMPRAS
    // ═══════════════════════════════════════════════════════════════════════
    '/compras': {
      get: {
        tags: ['Compras'],
        summary: 'Listar órdenes de compra',
        parameters: [
          { $ref: '#/components/parameters/FechaDesde' },
          { $ref: '#/components/parameters/FechaHasta' },
          { name: 'id_proveedor', in: 'query', schema: { type: 'integer' }, description: 'Filtrar por proveedor' },
          { name: 'estado', in: 'query', schema: { type: 'string', enum: ['pendiente', 'recibida', 'cancelada'] } },
        ],
        responses: {
          200: { description: 'Lista de compras', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Compra' } } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Compras'],
        summary: 'Registrar orden de compra',
        description: 'Crea una orden de compra e incrementa el stock de los productos. **Requiere rol gerente o administrador.**',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CompraCreate' },
              example: { id_proveedor: 1, items: [{ id_producto: 5, cantidad: 50, precio_unitario: 18.00 }], notas: 'Pedido urgente' },
            },
          },
        },
        responses: {
          201: { description: 'Compra registrada', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/Compra' } } }] } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/compras/{id}': {
      get: {
        tags: ['Compras'],
        summary: 'Obtener compra por ID',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: {
          200: { description: 'Datos de la compra', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/Compra' } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/compras/{id}/cancelar': {
      patch: {
        tags: ['Compras'],
        summary: 'Cancelar compra',
        description: 'Cancela la compra y revierte el stock incrementado. **Requiere rol gerente o administrador.**',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: {
          200: { description: 'Compra cancelada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CATÁLOGOS — Categorías
    // ═══════════════════════════════════════════════════════════════════════
    '/catalogos/categorias': {
      get: {
        tags: ['Catálogos'],
        summary: 'Listar categorías',
        responses: {
          200: { description: 'Lista de categorías', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Categoria' } } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Catálogos'],
        summary: 'Crear categoría',
        description: '**Requiere rol gerente o administrador.**',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['nombre'], properties: { nombre: { type: 'string', example: 'Lácteos' } } } } } },
        responses: {
          201: { description: 'Categoría creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/catalogos/categorias/{id}': {
      put: {
        tags: ['Catálogos'],
        summary: 'Actualizar categoría',
        description: '**Requiere rol gerente o administrador.**',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { nombre: { type: 'string', example: 'Lácteos y derivados' } } } } } },
        responses: {
          200: { description: 'Categoría actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Catálogos'],
        summary: 'Eliminar categoría',
        description: 'Falla con 409 si hay productos asignados. **Requiere rol administrador.**',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: {
          200: { description: 'Categoría eliminada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { description: 'Hay productos asociados a esta categoría', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CATÁLOGOS — Proveedores
    // ═══════════════════════════════════════════════════════════════════════
    '/catalogos/proveedores': {
      get: {
        tags: ['Catálogos'],
        summary: 'Listar proveedores',
        responses: {
          200: { description: 'Lista de proveedores', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Proveedor' } } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Catálogos'],
        summary: 'Crear proveedor',
        description: '**Requiere rol gerente o administrador.**',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['nombre'], properties: { nombre: { type: 'string' }, contacto: { type: 'string' }, telefono: { type: 'string' }, email: { type: 'string', format: 'email' }, direccion: { type: 'string' } } },
              example: { nombre: 'Distribuidora del Norte SA', contacto: 'Pedro Ramírez', telefono: '618-555-0100', email: 'ventas@distrinorte.mx', direccion: 'Calle Industrial 400' },
            },
          },
        },
        responses: {
          201: { description: 'Proveedor creado', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/Proveedor' } } }] } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/catalogos/proveedores/{id}': {
      put: {
        tags: ['Catálogos'],
        summary: 'Actualizar proveedor',
        description: '**Requiere rol gerente o administrador.**',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Proveedor' } } } },
        responses: {
          200: { description: 'Proveedor actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Catálogos'],
        summary: 'Eliminar proveedor',
        description: '**Requiere rol administrador.**',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: {
          200: { description: 'Proveedor eliminado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CATÁLOGOS — Clientes
    // ═══════════════════════════════════════════════════════════════════════
    '/catalogos/clientes': {
      get: {
        tags: ['Catálogos'],
        summary: 'Listar clientes',
        responses: {
          200: { description: 'Lista de clientes', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Cliente' } } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Catálogos'],
        summary: 'Crear cliente',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Cliente' }, example: { nombre: 'María González', telefono: '618-555-0200', email: 'maria@correo.com' } } } },
        responses: {
          201: { description: 'Cliente creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/catalogos/clientes/{id}': {
      put: {
        tags: ['Catálogos'],
        summary: 'Actualizar cliente',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Cliente' } } } },
        responses: {
          200: { description: 'Cliente actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Catálogos'],
        summary: 'Eliminar cliente',
        description: '**Requiere rol gerente o administrador.**',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: {
          200: { description: 'Cliente eliminado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CATÁLOGOS — Unidades de medida
    // ═══════════════════════════════════════════════════════════════════════
    '/catalogos/unidades': {
      get: {
        tags: ['Catálogos'],
        summary: 'Listar unidades de medida',
        responses: {
          200: { description: 'Lista de unidades', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Catálogos'],
        summary: 'Crear unidad de medida',
        description: '**Requiere rol gerente o administrador.**',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['nombre'], properties: { nombre: { type: 'string', example: 'Kilogramo' }, abreviatura: { type: 'string', example: 'kg' } } } } } },
        responses: {
          201: { description: 'Unidad creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/catalogos/unidades/{id}': {
      put: {
        tags: ['Catálogos'],
        summary: 'Actualizar unidad de medida',
        description: '**Requiere rol gerente o administrador.**',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { nombre: { type: 'string' }, abreviatura: { type: 'string' } } } } } },
        responses: {
          200: { description: 'Unidad actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CORTE DE CAJA
    // ═══════════════════════════════════════════════════════════════════════
    '/corte-caja': {
      get: {
        tags: ['Corte de Caja'],
        summary: 'Historial de cortes',
        description: '**Requiere rol gerente o administrador.**',
        parameters: [
          { $ref: '#/components/parameters/FechaDesde' },
          { $ref: '#/components/parameters/FechaHasta' },
        ],
        responses: {
          200: { description: 'Lista de cortes de caja', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/CorteCaja' } } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Corte de Caja'],
        summary: 'Realizar corte de caja',
        description: 'Cierra la caja para la fecha indicada (defecto: hoy). Solo puede haber un corte por fecha. **Requiere rol gerente o administrador.**',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CorteCajaCreate' },
              example: { efectivo_contado: 1850.00, fecha: '2026-07-02', notas: 'Sin novedades' },
            },
          },
        },
        responses: {
          201: {
            description: 'Corte registrado',
            content: {
              'application/json': {
                schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/CorteCaja' } } }] },
                example: { success: true, data: { id: 15, fecha: '2026-07-02', total_ventas: 3450.00, efectivo_esperado: 1800.00, efectivo_contado: 1850.00, diferencia: 50.00 } },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { description: 'Ya existe un corte cerrado para esa fecha', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' }, example: { success: false, error: 'Ya existe un corte de caja cerrado para el 2026-07-02' } } } },
        },
      },
    },

    '/corte-caja/preview': {
      get: {
        tags: ['Corte de Caja'],
        summary: 'Vista previa del corte',
        description: 'Calcula los totales del día sin guardar el corte. Útil para mostrar al gerente antes de confirmar. **Requiere rol gerente o administrador.**',
        parameters: [
          { name: 'fecha', in: 'query', schema: { type: 'string', format: 'date', example: '2026-07-02' }, description: 'Defecto: hoy' },
        ],
        responses: {
          200: {
            description: 'Resumen de ventas del día',
            content: {
              'application/json': {
                schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/CorteCajaPreview' } } }] },
                example: { success: true, data: { total_ventas: 3450.00, efectivo_esperado: 1800.00, total_tarjeta: 1200.00, total_transferencia: 450.00, total_otros: 0 } },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/corte-caja/{id}': {
      get: {
        tags: ['Corte de Caja'],
        summary: 'Obtener corte por ID',
        description: '**Requiere rol gerente o administrador.**',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: {
          200: { description: 'Datos del corte', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/CorteCaja' } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // REPORTES
    // ═══════════════════════════════════════════════════════════════════════
    '/reportes/resumen-diario': {
      get: {
        tags: ['Reportes'],
        summary: 'Resumen del día',
        description: 'Totales de ventas, productos vendidos, método de pago y productos con stock bajo. **Requiere rol gerente o administrador.**',
        parameters: [
          { name: 'fecha', in: 'query', schema: { type: 'string', format: 'date', example: '2026-07-02' }, description: 'Defecto: hoy' },
        ],
        responses: {
          200: {
            description: 'Resumen diario',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    fecha: '2026-07-02',
                    total_ventas: 3450.00,
                    num_ventas: 28,
                    ticket_promedio: 123.21,
                    por_metodo_pago: { efectivo: 1800, tarjeta: 1200, transferencia: 450 },
                    productos_bajo_stock: 3,
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/reportes/ventas-periodo': {
      get: {
        tags: ['Reportes'],
        summary: 'Ventas por período',
        description: 'Agrupación diaria de ventas en el rango indicado. Ambos parámetros son obligatorios. **Requiere rol gerente o administrador.**',
        parameters: [
          { name: 'desde', in: 'query', required: true, schema: { type: 'string', format: 'date', example: '2026-07-01' } },
          { name: 'hasta', in: 'query', required: true, schema: { type: 'string', format: 'date', example: '2026-07-31' } },
        ],
        responses: {
          200: {
            description: 'Ventas agrupadas por día',
            content: {
              'application/json': {
                example: { success: true, data: [{ fecha: '2026-07-01', total: 2100.00, num_ventas: 18 }, { fecha: '2026-07-02', total: 3450.00, num_ventas: 28 }] },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/reportes/productos-mas-vendidos': {
      get: {
        tags: ['Reportes'],
        summary: 'Productos más vendidos',
        description: '**Requiere rol gerente o administrador.**',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, example: 5 }, description: 'Cantidad de productos a retornar' },
          { $ref: '#/components/parameters/FechaDesde' },
          { $ref: '#/components/parameters/FechaHasta' },
        ],
        responses: {
          200: {
            description: 'Ranking de productos',
            content: {
              'application/json': {
                example: { success: true, data: [{ id_producto: 5, nombre: 'Manzana Roja kg', total_vendido: 148.5, ingresos: 4826.25 }] },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/reportes/inventario-valorizado': {
      get: {
        tags: ['Reportes'],
        summary: 'Valor del inventario',
        description: 'Calcula el valor total del inventario por producto (stock × costo_unitario) y el total general. **Requiere rol gerente o administrador.**',
        responses: {
          200: {
            description: 'Inventario valorizado',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    total: 45820.00,
                    productos: [{ id: 5, nombre: 'Manzana Roja kg', stock_actual: 47.5, costo_unitario: 18.00, valor_total: 855.00 }],
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
