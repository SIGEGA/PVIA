-- =============================================================================
-- SCRIPT SQL - SISTEMA DE PUNTO DE VENTA (POS) ABARROTES Y FRUTERÍA
-- =============================================================================
-- Autor: Sistema Análisis de Requerimientos
-- Fecha: 2026-06-29
-- BD: PostgreSQL 12+
-- Descripción: Modelo multi-sucursal con tablas empresa y sucursal
-- =============================================================================

-- Eliminar tablas si existen (en orden de dependencias)
DROP TABLE IF EXISTS auditoria CASCADE;
DROP TABLE IF EXISTS movimiento_inventario CASCADE;
DROP TABLE IF EXISTS detalle_compra CASCADE;
DROP TABLE IF EXISTS compras CASCADE;
DROP TABLE IF EXISTS gastos CASCADE;
DROP TABLE IF EXISTS corte_caja CASCADE;
DROP TABLE IF EXISTS detalle_venta CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS sucursales CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;

-- =============================================================================
-- TABLA: EMPRESAS
-- Descripción: Empresa matriz que gestiona una o varias sucursales
-- =============================================================================
CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    ruc_nit VARCHAR(50) UNIQUE NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(30),
    email VARCHAR(120),
    ciudad VARCHAR(100),
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_empresas_estado ON empresas(estado);

-- =============================================================================
-- TABLA: SUCURSALES
-- Descripción: Sucursales vinculadas a una empresa
-- =============================================================================
CREATE TABLE sucursales (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    codigo_sucursal VARCHAR(50) UNIQUE NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(30),
    ciudad VARCHAR(100),
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_sucursales_empresa ON sucursales(empresa_id);
CREATE INDEX idx_sucursales_estado ON sucursales(estado);

-- =============================================================================
-- TABLA: USUARIOS
-- Descripción: Usuarios del sistema con acceso por empresa y sucursal
-- =============================================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    sucursal_id INTEGER,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(120) UNIQUE NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('vendedor', 'gerente', 'administrador')),
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_valid CHECK (correo LIKE '%@%'),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX idx_usuarios_sucursal ON usuarios(sucursal_id);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_estado ON usuarios(estado);

-- =============================================================================
-- TABLA: CATEGORIAS
-- Descripción: Categorías de productos por empresa y sucursal
-- =============================================================================
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    sucursal_id INTEGER,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE (empresa_id, nombre)
);

CREATE INDEX idx_categorias_empresa ON categorias(empresa_id);
CREATE INDEX idx_categorias_sucursal ON categorias(sucursal_id);

-- =============================================================================
-- TABLA: PRODUCTOS
-- Descripción: Catálogo de productos disponibles a nivel de sucursal
-- =============================================================================
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    sucursal_id INTEGER NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria_id INTEGER NOT NULL,
    precio_venta DECIMAL(10, 2) NOT NULL CHECK (precio_venta > 0),
    costo_unitario DECIMAL(10, 2) NOT NULL CHECK (costo_unitario > 0),
    stock_actual DECIMAL(10, 3) NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo INTEGER NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_productos_empresa ON productos(empresa_id);
CREATE INDEX idx_productos_sucursal ON productos(sucursal_id);
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_estado ON productos(estado);
CREATE INDEX idx_productos_stock ON productos(stock_actual);

-- =============================================================================
-- TABLA: CLIENTES
-- Descripción: Clientes que realizan compras en una sucursal
-- =============================================================================
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    sucursal_id INTEGER NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    documento VARCHAR(50) UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(120),
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    tipo VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (tipo IN ('normal', 'mayorista')),
    credito_permitido BOOLEAN DEFAULT FALSE,
    limite_credito DECIMAL(10, 2) DEFAULT 0,
    saldo_credito DECIMAL(10, 2) DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_clientes_empresa ON clientes(empresa_id);
CREATE INDEX idx_clientes_sucursal ON clientes(sucursal_id);
CREATE INDEX idx_clientes_documento ON clientes(documento);
CREATE INDEX idx_clientes_estado ON clientes(estado);

-- =============================================================================
-- TABLA: VENTAS
-- Descripción: Registro de todas las ventas realizadas por sucursal
-- =============================================================================
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    sucursal_id INTEGER NOT NULL,
    numero_transaccion VARCHAR(50) UNIQUE NOT NULL,
    usuario_id INTEGER NOT NULL,
    cliente_id INTEGER,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    hora TIME NOT NULL DEFAULT CURRENT_TIME,
    estado VARCHAR(20) NOT NULL DEFAULT 'completada' CHECK (estado IN ('completada', 'anulada', 'pendiente')),
    total_antes_descuento DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_antes_descuento >= 0),
    descuento DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (descuento >= 0),
    porcentaje_descuento DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (porcentaje_descuento >= 0 AND porcentaje_descuento <= 100),
    impuesto DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (impuesto >= 0),
    total_final DECIMAL(10, 2) NOT NULL CHECK (total_final >= 0),
    forma_pago VARCHAR(20) NOT NULL CHECK (forma_pago IN ('efectivo', 'tarjeta', 'cheque', 'transferencia')),
    referencia_pago VARCHAR(100),
    observaciones TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_ventas_empresa ON ventas(empresa_id);
CREATE INDEX idx_ventas_sucursal ON ventas(sucursal_id);
CREATE INDEX idx_ventas_numero ON ventas(numero_transaccion);
CREATE INDEX idx_ventas_usuario ON ventas(usuario_id);
CREATE INDEX idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_ventas_estado ON ventas(estado);
CREATE INDEX idx_ventas_forma_pago ON ventas(forma_pago);

-- =============================================================================
-- TABLA: DETALLE_VENTA
-- =============================================================================
CREATE TABLE detalle_venta (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad DECIMAL(10, 3) NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10, 2) NOT NULL CHECK (precio_unitario > 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    descuento_item DECIMAL(10, 2) DEFAULT 0 CHECK (descuento_item >= 0),
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_detalle_venta_venta ON detalle_venta(venta_id);
CREATE INDEX idx_detalle_venta_producto ON detalle_venta(producto_id);

-- =============================================================================
-- TABLA: PROVEEDORES
-- Descripción: Proveedores de productos para compra por sucursal
-- =============================================================================
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    sucursal_id INTEGER NOT NULL,
    nombre VARCHAR(150) UNIQUE NOT NULL,
    contacto VARCHAR(150),
    telefono VARCHAR(20),
    email VARCHAR(120),
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    ruc_nit VARCHAR(50),
    plazo_pago_dias INTEGER DEFAULT 30,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_proveedores_empresa ON proveedores(empresa_id);
CREATE INDEX idx_proveedores_sucursal ON proveedores(sucursal_id);
CREATE INDEX idx_proveedores_estado ON proveedores(estado);

-- =============================================================================
-- TABLA: COMPRAS
-- Descripción: Registro de compras a proveedores por sucursal
-- =============================================================================
CREATE TABLE compras (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    sucursal_id INTEGER NOT NULL,
    numero_compra VARCHAR(50) UNIQUE NOT NULL,
    proveedor_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    total_antes_impuesto DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_antes_impuesto >= 0),
    impuesto DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (impuesto >= 0),
    total_final DECIMAL(10, 2) NOT NULL CHECK (total_final >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'recibida', 'cancelada')),
    observaciones TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_recibida TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_compras_empresa ON compras(empresa_id);
CREATE INDEX idx_compras_sucursal ON compras(sucursal_id);
CREATE INDEX idx_compras_numero ON compras(numero_compra);
CREATE INDEX idx_compras_proveedor ON compras(proveedor_id);
CREATE INDEX idx_compras_usuario ON compras(usuario_id);
CREATE INDEX idx_compras_fecha ON compras(fecha);
CREATE INDEX idx_compras_estado ON compras(estado);

-- =============================================================================
-- TABLA: DETALLE_COMPRA
-- =============================================================================
CREATE TABLE detalle_compra (
    id SERIAL PRIMARY KEY,
    compra_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad DECIMAL(10, 3) NOT NULL CHECK (cantidad > 0),
    costo_unitario DECIMAL(10, 2) NOT NULL CHECK (costo_unitario > 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    numero_lote VARCHAR(100),
    fecha_vencimiento DATE,
    FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_detalle_compra_compra ON detalle_compra(compra_id);
CREATE INDEX idx_detalle_compra_producto ON detalle_compra(producto_id);
CREATE INDEX idx_detalle_compra_vencimiento ON detalle_compra(fecha_vencimiento);

-- =============================================================================
-- TABLA: MOVIMIENTO_INVENTARIO
-- Descripción: Registro de movimientos de stock por sucursal
-- =============================================================================
CREATE TABLE movimiento_inventario (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    sucursal_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
    cantidad DECIMAL(10, 3) NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    usuario_id INTEGER NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    hora TIME NOT NULL DEFAULT CURRENT_TIME,
    referencia VARCHAR(100),
    observaciones TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_movimiento_inventario_empresa ON movimiento_inventario(empresa_id);
CREATE INDEX idx_movimiento_inventario_sucursal ON movimiento_inventario(sucursal_id);
CREATE INDEX idx_movimiento_inventario_producto ON movimiento_inventario(producto_id);
CREATE INDEX idx_movimiento_inventario_tipo ON movimiento_inventario(tipo);
CREATE INDEX idx_movimiento_inventario_fecha ON movimiento_inventario(fecha);
CREATE INDEX idx_movimiento_inventario_usuario ON movimiento_inventario(usuario_id);

-- =============================================================================
-- TABLA: GASTOS
-- Descripción: Gastos operacionales por sucursal
-- =============================================================================
CREATE TABLE gastos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    sucursal_id INTEGER NOT NULL,
    numero_gasto VARCHAR(50) UNIQUE NOT NULL,
    usuario_id INTEGER NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('servicios', 'mantenimiento', 'suministros', 'otros')),
    monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
    descripcion TEXT NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'registrado' CHECK (estado IN ('registrado', 'pagado')),
    referencia VARCHAR(100),
    comprobante_numero VARCHAR(50),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_gastos_empresa ON gastos(empresa_id);
CREATE INDEX idx_gastos_sucursal ON gastos(sucursal_id);
CREATE INDEX idx_gastos_usuario ON gastos(usuario_id);
CREATE INDEX idx_gastos_fecha ON gastos(fecha);
CREATE INDEX idx_gastos_categoria ON gastos(categoria);
CREATE INDEX idx_gastos_estado ON gastos(estado);

-- =============================================================================
-- TABLA: CORTE_CAJA
-- Descripción: Cierres de caja diarios por sucursal
-- =============================================================================
CREATE TABLE corte_caja (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    sucursal_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    total_ventas DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_ventas >= 0),
    total_efectivo_esperado DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_efectivo_esperado >= 0),
    total_efectivo_contado DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_efectivo_contado >= 0),
    diferencia_efectivo DECIMAL(10, 2) DEFAULT 0,
    total_tarjeta DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_tarjeta >= 0),
    total_cheque DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_cheque >= 0),
    total_transferencia DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_transferencia >= 0),
    total_general DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_general >= 0),
    total_gastos DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_gastos >= 0),
    ganancia_neta DECIMAL(10, 2) DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado')),
    observaciones TEXT,
    fecha_apertura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(empresa_id, sucursal_id, fecha)
);

CREATE INDEX idx_corte_caja_empresa ON corte_caja(empresa_id);
CREATE INDEX idx_corte_caja_sucursal ON corte_caja(sucursal_id);
CREATE INDEX idx_corte_caja_usuario ON corte_caja(usuario_id);
CREATE INDEX idx_corte_caja_fecha ON corte_caja(fecha);
CREATE INDEX idx_corte_caja_estado ON corte_caja(estado);

-- =============================================================================
-- TABLA: AUDITORIA
-- Descripción: Registro completo de auditoría por empresa y sucursal
-- =============================================================================
CREATE TABLE auditoria (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    sucursal_id INTEGER,
    usuario_id INTEGER,
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('crear', 'actualizar', 'eliminar', 'consultar')),
    tabla_afectada VARCHAR(100) NOT NULL,
    registro_id INTEGER,
    datos_antes TEXT,
    datos_despues TEXT,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    navegador VARCHAR(255),
    sesion_id VARCHAR(255),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_auditoria_empresa ON auditoria(empresa_id);
CREATE INDEX idx_auditoria_sucursal ON auditoria(sucursal_id);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_tabla ON auditoria(tabla_afectada);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha);
CREATE INDEX idx_auditoria_accion ON auditoria(accion);

-- =============================================================================
-- VISTAS ÚTILES
-- =============================================================================

CREATE OR REPLACE VIEW vw_productos_stock_bajo AS
SELECT 
    p.id,
    p.codigo,
    p.nombre,
    p.stock_actual,
    p.stock_minimo,
    c.nombre as categoria,
    p.precio_venta,
    s.nombre as sucursal
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
JOIN sucursales s ON p.sucursal_id = s.id
WHERE p.estado = 'activo' AND p.stock_actual <= p.stock_minimo
ORDER BY p.stock_actual ASC;

CREATE OR REPLACE VIEW vw_ventas_diarias AS
SELECT 
    DATE(v.fecha) as fecha,
    v.sucursal_id,
    COUNT(*) as total_transacciones,
    SUM(v.total_final) as total_ventas,
    AVG(v.total_final) as promedio_transaccion,
    SUM(v.descuento) as total_descuentos,
    SUM(v.impuesto) as total_impuestos,
    u.nombre as vendedor
FROM ventas v
JOIN usuarios u ON v.usuario_id = u.id
WHERE v.estado = 'completada'
GROUP BY DATE(v.fecha), v.sucursal_id, u.id, u.nombre
ORDER BY DATE(v.fecha) DESC;

CREATE OR REPLACE VIEW vw_rentabilidad_producto AS
SELECT 
    p.id,
    p.codigo,
    p.nombre,
    COUNT(dv.id) as cantidad_vendida,
    SUM(dv.cantidad) as unidades_vendidas,
    SUM(dv.subtotal) as ingresos,
    (SUM(dv.cantidad) * p.costo_unitario) as costo_total,
    (SUM(dv.subtotal) - (SUM(dv.cantidad) * p.costo_unitario)) as ganancia_bruta,
    ROUND(((SUM(dv.subtotal) - (SUM(dv.cantidad) * p.costo_unitario)) / NULLIF(SUM(dv.subtotal), 0)) * 100, 2) as margen_porcentaje
FROM productos p
LEFT JOIN detalle_venta dv ON p.id = dv.producto_id
LEFT JOIN ventas v ON dv.venta_id = v.id AND v.estado = 'completada'
WHERE p.estado = 'activo'
GROUP BY p.id, p.codigo, p.nombre, p.costo_unitario
ORDER BY ganancia_bruta DESC;

-- =============================================================================
-- TRIGGERS DE AUDITORÍA Y CONTROL
-- =============================================================================

CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_productos_update
BEFORE UPDATE ON productos
FOR EACH ROW
EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER tr_usuarios_update
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER tr_sucursales_update
BEFORE UPDATE ON sucursales
FOR EACH ROW
EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER tr_empresas_update
BEFORE UPDATE ON empresas
FOR EACH ROW
EXECUTE FUNCTION update_fecha_actualizacion();

-- =============================================================================
-- DATOS DE PRUEBA
-- =============================================================================

INSERT INTO empresas (nombre, ruc_nit, direccion, telefono, email, ciudad) VALUES
('Mi Abarrote', '12345678901', 'Av. Principal 123', '555-0100', 'contacto@miabarrote.com', 'Ciudad');

INSERT INTO sucursales (empresa_id, nombre, codigo_sucursal, direccion, telefono, ciudad) VALUES
(1, 'Sucursal Central', 'SUC-001', 'Av. Principal 123', '555-0101', 'Ciudad');

INSERT INTO usuarios (empresa_id, sucursal_id, nombre, correo, usuario, contraseña, rol) VALUES
(1, 1, 'Juan Pérez', 'juan@miabarrote.com', 'juan_vendedor', 'hashed_password_123', 'vendedor'),
(1, 1, 'María García', 'maria@miabarrote.com', 'maria_vendedor', 'hashed_password_456', 'vendedor'),
(1, 1, 'Carlos López', 'carlos@miabarrote.com', 'carlos_gerente', 'hashed_password_789', 'gerente'),
(1, 1, 'Ana Martínez', 'ana@miabarrote.com', 'ana_admin', 'hashed_password_000', 'administrador');

INSERT INTO categorias (empresa_id, sucursal_id, nombre, descripcion) VALUES
(1, 1, 'Abarrotes', 'Productos de almacén y consumo diario'),
(1, 1, 'Frutas', 'Frutas frescas y variadas'),
(1, 1, 'Verduras', 'Verduras y hortalizas'),
(1, 1, 'Bebidas', 'Refrescos y bebidas variadas'),
(1, 1, 'Lácteos', 'Productos lácteos y derivados');

INSERT INTO productos (empresa_id, sucursal_id, codigo, nombre, descripcion, categoria_id, precio_venta, costo_unitario, stock_actual, stock_minimo) VALUES
(1, 1, 'ARROZ-001', 'Arroz Blanco 1kg', 'Arroz blanco de calidad premium', 1, 5.50, 3.20, 50, 10),
(1, 1, 'AZUC-001', 'Azúcar Blanca 1kg', 'Azúcar cristalizada blanca', 1, 4.00, 2.50, 30, 10),
(1, 1, 'FRESA-001', 'Fresas Frescas 500g', 'Fresas frescas de temporada', 2, 6.50, 3.80, 15, 5),
(1, 1, 'MANZANA-001', 'Manzana Roja 1kg', 'Manzanas rojas frescas', 2, 7.00, 4.20, 25, 8),
(1, 1, 'PLATANO-001', 'Plátano Maduro 1kg', 'Plátano amarillo maduro', 2, 2.50, 1.20, 40, 15),
(1, 1, 'LECHE-001', 'Leche Entera 1L', 'Leche entera fresca', 5, 3.20, 1.80, 60, 20),
(1, 1, 'PAN-001', 'Pan Blanco Francés', 'Pan francés recién horneado', 1, 2.00, 1.10, 35, 10);

INSERT INTO clientes (empresa_id, sucursal_id, nombre, documento, telefono, email, tipo) VALUES
(1, 1, 'Cliente General', NULL, NULL, NULL, 'normal'),
(1, 1, 'Distribuidor A', '12345678', '555-0001', 'dist.a@email.com', 'mayorista'),
(1, 1, 'Distribuidor B', '87654321', '555-0002', 'dist.b@email.com', 'mayorista');

INSERT INTO proveedores (empresa_id, sucursal_id, nombre, contacto, telefono, email, ciudad, ruc_nit) VALUES
(1, 1, 'Distribuidora Central', 'Pedro Rojas', '555-1001', 'ventas@distcentral.com', 'Capital', '9876543210001'),
(1, 1, 'Frutas del Valle', 'Rosa Mendez', '555-1002', 'contacto@frutasvalle.com', 'Valle', '9876543210002'),
(1, 1, 'Lácteos del País', 'Miguel Ruiz', '555-1003', 'info@lacteosdelpais.com', 'Región', '9876543210003');

-- =============================================================================
-- CREACIÓN DE ÍNDICES ADICIONALES PARA PERFORMANCE
-- =============================================================================

CREATE INDEX idx_ventas_usuario_fecha ON ventas(usuario_id, fecha);
CREATE INDEX idx_ventas_forma_pago_fecha ON ventas(forma_pago, fecha);
CREATE INDEX idx_detalle_venta_producto_venta ON detalle_venta(producto_id, venta_id);
CREATE INDEX idx_movimiento_inventario_producto_fecha ON movimiento_inventario(producto_id, fecha);
CREATE INDEX idx_auditoria_tabla_fecha ON auditoria(tabla_afectada, fecha);

-- =============================================================================
-- CONFIRMACIÓN DE INSTALACIÓN
-- =============================================================================

SELECT 'Instalación completada exitosamente!' as estado;
SELECT COUNT(*) as total_tablas FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================
