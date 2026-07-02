# Especificación de Requerimientos - Sistema de Punto de Venta (POS) Abarrotes y Frutería

## 1. Descripción General del Proyecto

Sistema de gestión integral para un punto de venta pequeño/mediano que vende abarrotes y frutas, con capacidades de:
- Control de inventario en tiempo real
- Gestión de ventas y transacciones
- Reportes de ventas y productos
- Cierre de caja diario
- Gestión de usuarios y permisos

---

## 2. Actores del Sistema

- **Vendedor**: Realiza ventas, consulta inventario, procesa transacciones
- **Gerente**: Supervisa ventas, genera reportes, gestiona usuarios
- **Administrador**: Configuración del sistema, respaldos, mantenimiento
- **Cliente**: Compra productos (interacción mínima)

---

## 3. Historias de Usuario y Criterios de Aceptación

### 3.1 Gestión de Productos

#### US-001: Registrar un nuevo producto

**Como** gerente o administrador  
**Quiero** registrar nuevos productos en el sistema  
**Para** tener un inventario actualizado

**Criterios de Aceptación:**

```gherkin
Given el usuario está autenticado como gerente o administrador
And está en la pantalla de gestión de productos
When ingresa los datos: código, nombre, descripción, precio, categoría
And ingresa la cantidad inicial en stock
And hace clic en "Guardar"
Then el producto se registra en la base de datos
And se muestra mensaje de éxito
And el producto aparece en la lista de inventario

Given el código del producto ya existe en el sistema
When intenta guardar un producto con el mismo código
Then se muestra error: "Código de producto duplicado"
And el producto no se registra

Given deja vacío el campo "nombre" o "precio"
When intenta guardar
Then se muestra error: "Campo requerido"
And el producto no se registra
```

#### US-002: Actualizar información del producto

**Como** vendedor o gerente  
**Quiero** actualizar el precio o descripción de un producto  
**Para** mantener los datos del inventario precisos

**Criterios de Aceptación:**

```gherkin
Given el usuario busca un producto existente
And accede a editar sus datos
When modifica el precio, descripción o categoría
And guarda los cambios
Then el sistema actualiza el producto
And se registra quién hizo el cambio y cuándo (auditoría)

Given intenta modificar el código del producto
Then el campo está deshabilitado
And se muestra tooltip: "El código no puede modificarse"
```

#### US-003: Consultar estado de inventario

**Como** vendedor  
**Quiero** consultar el stock disponible de un producto  
**Para** saber si puedo venderlo

**Criterios de Aceptación:**

```gherkin
Given el vendedor está en el módulo de ventas
When ingresa el código o nombre del producto
Then el sistema muestra: código, nombre, stock actual, precio
And se muestra en tiempo real

Given el producto tiene stock < 10 unidades
Then el stock se muestra en color rojo (alerta)
And aparece icono de advertencia

Given el producto tiene stock = 0
When intenta agregar a la venta
Then se muestra error: "Producto agotado"
And no se permite agregar a la transacción
```

#### US-004: Eliminar producto del sistema

**Como** administrador  
**Quiero** eliminar un producto que ya no vendo  
**Para** limpiar el catálogo

**Criterios de Aceptación:**

```gherkin
Given el usuario es administrador
And selecciona un producto
When hace clic en "Eliminar"
Then se muestra confirmación: "¿Seguro que desea eliminar?"
And si hace clic en "Sí"
Then el producto se marca como inactivo (no se elimina de BD)
And desaparece de las búsquedas normales

Given el producto tiene transacciones asociadas
When intenta eliminarlo
Then se muestra error: "No se puede eliminar producto con historial"
And ofrece marcar como inactivo
```

---

### 3.2 Gestión de Ventas

#### US-005: Crear una transacción de venta

**Como** vendedor  
**Quiero** registrar una venta agregando productos  
**Para** completar la transacción con el cliente

**Criterios de Aceptación:**

```gherkin
Given el vendedor abre una nueva transacción
And ingresa/escanea el código del producto
When selecciona cantidad
And hace clic en "Agregar al carrito"
Then el producto aparece en la lista de la venta
And se muestra: descripción, precio unitario, cantidad, subtotal
And el subtotal se calcula automáticamente

Given agrega más productos
When calcula el total
Then se muestra: subtotal, impuesto (si aplica), descuento (si aplica), total
And se actualiza en tiempo real

Given la cantidad ingresada excede el stock
When intenta agregar
Then se muestra error: "Stock insuficiente. Disponible: X unidades"

Given ingresa cantidad con decimales para productos que lo permiten (frutas)
When confirma
Then se acepta y registra correctamente
```

#### US-006: Aplicar descuento a la venta

**Como** gerente o vendedor autorizado  
**Quiero** aplicar un descuento a la transacción  
**Para** ofrecer promociones o ajustes

**Criterios de Aceptación:**

```gherkin
Given la venta tiene productos agregados
And el vendedor tiene permiso de descuento
When selecciona "Aplicar descuento"
And ingresa: tipo (%) o ($), valor
And confirma
Then el descuento se aplica
And se actualiza el total

Given intenta aplicar descuento > 50%
Then se muestra error: "Descuento excede límite permitido (50%)"
And requiere aprobación de gerente

Given ingresa un valor inválido (negativo o texto)
When intenta aplicar
Then se muestra error: "Valor inválido"
And el descuento no se aplica
```

#### US-007: Registrar forma de pago

**Como** vendedor  
**Quiero** seleccionar la forma de pago  
**Para** completar la transacción

**Criterios de Aceptación:**

```gherkin
Given la venta está lista para pagar
And hace clic en "Pagar"
When selecciona forma de pago: efectivo, tarjeta, cheque, transferencia
Then se muestra ventana de pago con opciones
And se registra el método seleccionado

Given selecciona efectivo
And ingresa monto recibido
When el monto >= total
Then se calcula vuelto automáticamente
And muestra: Total, Monto recibido, Vuelto

Given el monto < total
Then se muestra error: "Monto insuficiente"
And no permite confirmar

Given selecciona tarjeta
When confirma pago
Then se registra número de transacción (últimos 4 dígitos simulados)
And genera comprobante
```

#### US-008: Generar comprobante de venta

**Como** vendedor  
**Quiero** imprimir un comprobante de la venta  
**Para** entregar al cliente

**Criterios de Aceptación:**

```gherkin
Given se completó la transacción
And hace clic en "Generar comprobante"
When se genera el documento
Then incluye: número de transacción, fecha, hora, productos, cantidades, precios
And incluye: subtotal, impuestos, descuentos, total
And incluye: forma de pago, vuelto (si aplica)
And se imprime o descarga en PDF

Given no hay impresora conectada
When intenta imprimir
Then se muestra opción: "Guardar como PDF"
And permite descargar documento
```

#### US-009: Anular una transacción

**Como** gerente o vendedor autorizado  
**Quiero** anular una venta completada  
**Para** corregir errores

**Criterios de Aceptación:**

```gherkin
Given selecciona una venta completada (máximo 24 horas)
When hace clic en "Anular transacción"
Then se muestra confirmación con motivo
And requiere contraseña de gerente
And si confirma
Then la venta se marca como anulada
And el stock se restaura automáticamente
And se registra en auditoría: quién, cuándo, motivo

Given intenta anular una venta > 24 horas
Then se muestra error: "No se pueden anular ventas antiguas"
And ofrece crear nota de crédito
```

---

### 3.3 Gestión de Inventario

#### US-010: Registrar entrada de stock (compra a proveedor)

**Como** gerente o administrador  
**Quiero** registrar compras de productos a proveedores  
**Para** actualizar el inventario

**Criterios de Aceptación:**

```gherkin
Given accede a "Entrada de stock"
When ingresa: número de compra, proveedor, fecha
And agrega productos: código, cantidad, costo unitario
And confirma
Then se registra la entrada
And el stock de cada producto aumenta
And se registra costo de reposición

Given ingresa cantidad = 0 o negativa
When intenta guardar
Then se muestra error: "Cantidad debe ser mayor a 0"

Given el producto no existe en el sistema
When intenta agregarlo
Then se muestra opción: "¿Crear nuevo producto?"
```

#### US-011: Registrar salida de stock (donación, daño, devolución)

**Como** vendedor o gerente  
**Quiero** registrar salidas de stock no relacionadas con ventas  
**Para** mantener inventario preciso

**Criterios de Aceptación:**

```gherkin
Given accede a "Salida de stock"
When selecciona: tipo (merma, donación, devolución), producto, cantidad, motivo
And guarda
Then el stock disminuye
And se registra movimiento en auditoría

Given ingresa cantidad > stock disponible
When intenta guardar
Then se muestra error: "Cantidad excede stock disponible"

Given requiere aprobación de gerente
When selecciona tipo "donación" o "devolución"
Then se marca como "Pendiente aprobación"
And requiere confirmación del gerente para efectuarse
```

#### US-012: Generar reporte de inventario

**Como** gerente  
**Quiero** ver un reporte del inventario actual  
**Para** saber qué debo ordenar

**Criterios de Aceptación:**

```gherkin
Given accede a "Reportes" > "Inventario"
When selecciona: fecha, categoría (opcional), estado (activo/inactivo)
And hace clic en "Generar"
Then muestra tabla con: código, nombre, stock, costo, valor total, estado
And permite exportar a Excel o PDF

Given filtra por categoría "Frutas"
Then solo muestra productos de esa categoría
And actualiza totales

Given ordena por "Cantidad de stock"
When selecciona "Menor a Mayor"
Then los productos con menos stock aparecen primero
And facilita identificar productos para reabastecer
```

#### US-013: Alertas de stock bajo

**Como** gerente  
**Quiero** recibir alertas cuando el stock baja de un nivel mínimo  
**Para** evitar desabastecimiento

**Criterios de Aceptación:**

```gherkin
Given el producto tiene un stock mínimo configurado (ej: 5 unidades)
When el stock actual llega al mínimo
Then el sistema genera alerta
And muestra notificación en dashboard

Given accede a dashboard
Then ve lista de productos con alerta
And puede hacer clic para generar orden de compra automática
```

---

### 3.4 Cierre de Caja

#### US-014: Realizar cierre de caja diario

**Como** vendedor o gerente  
**Quiero** cerrar la caja al final del día  
**Para** reconciliar ventas y efectivo

**Criterios de Aceptación:**

```gherkin
Given es fin de jornada
And hace clic en "Cierre de caja"
When se genera reporte de: total de ventas, por forma de pago
Then muestra:
  - Efectivo esperado
  - Transacciones por tarjeta
  - Transacciones por cheque
  - Total general
And requiere confirmación y contraseña

Given ingresa monto de efectivo contado manualmente
When lo compara con el esperado
Then calcula diferencia: faltante o sobrante
And se registra en auditoría

Given hay diferencia
When confirma cierre
Then se genera reporte PDF
And se envía a correo del gerente
And caja queda cerrada para ese día

Given intenta cerrar sin haber vendido
When confirma
Then genera cierre con todas las cantidades en 0
And permite generar comprobante de caja cerrada
```

#### US-015: Generar reporte de cierre de caja

**Como** gerente  
**Quiero** acceder a reportes de cierres anteriores  
**Para** auditar operaciones

**Criterios de Aceptación:**

```gherkin
Given accede a "Reportes" > "Cierre de caja"
When selecciona rango de fechas
And hace clic en "Buscar"
Then muestra tabla con: fecha, usuario, total ventas, efectivo, tarjeta, diferencia, estado
And permite descargar cada cierre en PDF
```

---

### 3.5 Reportes y Análisis

#### US-016: Generar reporte de ventas

**Como** gerente  
**Quiero** ver un reporte de ventas por período  
**Para** analizar desempeño

**Criterios de Aceptación:**

```gherkin
Given accede a "Reportes" > "Ventas"
When selecciona: fecha inicio, fecha fin, vendedor (opcional), forma de pago (opcional)
And hace clic en "Generar"
Then muestra:
  - Total de transacciones
  - Total en ventas
  - Promedio de transacción
  - Desglose por forma de pago
  - Desglose por vendedor (si aplica)
And permite exportar a Excel

Given selecciona "Por producto"
When genera reporte
Then muestra tabla: código, nombre, cantidad vendida, ingresos, ganancia
And ordena por ingresos descendente
```

#### US-017: Generar reporte de ganancias

**Como** gerente  
**Quiero** ver ganancia vs costo  
**Para** conocer márgenes de rentabilidad

**Criterios de Aceptación:**

```gherkin
Given accede a "Reportes" > "Ganancias"
When selecciona período
And hace clic en "Generar"
Then muestra:
  - Ingresos totales (ventas)
  - Costo de productos vendidos
  - Ganancia bruta
  - Ganancia neta
  - Margen de ganancia (%)
And permite desglose por categoría o producto

Given no hay datos en el período
Then muestra mensaje: "Sin transacciones en este período"
```

---

### 3.6 Gestión de Usuarios y Seguridad

#### US-018: Registrar nuevo usuario

**Como** administrador  
**Quiero** crear usuarios en el sistema  
**Para** controlar acceso y permisos

**Criterios de Aceptación:**

```gherkin
Given es administrador
And accede a "Configuración" > "Usuarios"
When ingresa: nombre, correo, rol, contraseña temporal
And confirma
Then se crea el usuario
And se envía correo con credenciales
And debe cambiar contraseña en primer acceso

Given intenta crear usuario con correo duplicado
When intenta guardar
Then se muestra error: "Correo ya existe"

Given configura rol: vendedor, gerente, administrador
When guarda
Then se asignan automáticamente los permisos del rol
```

#### US-019: Autenticación de usuario

**Como** usuario  
**Quiero** iniciar sesión en el sistema  
**Para** acceder con credenciales

**Criterios de Aceptación:**

```gherkin
Given accede a la pantalla de login
When ingresa usuario/correo y contraseña correctos
And hace clic en "Entrar"
Then se validan credenciales
And inicia sesión
And se redirige al dashboard correspondiente a su rol

Given ingresa contraseña incorrecta 3 veces
Then se bloquea cuenta temporalmente (15 minutos)
And muestra: "Cuenta bloqueada. Intente en 15 minutos"

Given hace clic en "¿Olvidó contraseña?"
When ingresa su correo
Then se envía enlace de recuperación
And puede establecer nueva contraseña
```

#### US-020: Registrar acciones del usuario (auditoría)

**Como** administrador  
**Quiero** ver un registro de todas las acciones  
**Para** auditar y detectar irregularidades

**Criterios de Aceptación:**

```gherkin
Given accede a "Auditoría"
When selecciona filtros: usuario, tipo de acción (venta, eliminación, etc.), rango de fechas
And hace clic en "Buscar"
Then muestra tabla con: fecha/hora, usuario, acción, detalles, IP (si aplica)
And permite exportar a PDF

Given hace clic en un registro
When visualiza detalles
Then muestra antes/después de cambios (si aplica)
And muestra IP/dispositivo desde donde se realizó
```

---

### 3.7 Configuración del Sistema

#### US-021: Configurar parámetros del negocio

**Como** administrador  
**Quiero** configurar: nombre del negocio, impuestos, métodos de pago, límites de descuento  
**Para** personalizar el sistema

**Criterios de Aceptación:**

```gherkin
Given es administrador
And accede a "Configuración" > "Parámetros"
When modifica: nombre negocio, RUC/NIT, teléfono, dirección, porcentaje IVA
And guarda
Then se actualiza configuración
And se aplica a nuevas transacciones

Given habilita/deshabilita métodos de pago
When guarda
Then esos métodos aparecen/desaparecen en ventas

Given establece límite de descuento para vendedor
And un vendedor intenta aplicar descuento mayor
Then requiere aprobación de gerente
```

#### US-022: Realizar respaldo de datos

**Como** administrador  
**Quiero** hacer respaldo de la base de datos  
**Para** proteger información

**Criterios de Aceptación:**

```gherkin
Given accede a "Configuración" > "Respaldos"
When hace clic en "Hacer respaldo ahora"
Then se genera archivo comprimido (.zip)
And se muestra: fecha, tamaño, ubicación
And permite descargar manualmente

Given configura respaldo automático diario a las 23:00
When llega la hora
Then se ejecuta automáticamente
And se guarda en servidor o almacenamiento externo
```

---

## 4. Restricciones Técnicas

### 4.1 Arquitectura y Tecnología

- **Frontend**: React, Vue o Angular (a definir en próxima fase)
- **Backend**: Node.js/Express, Python/Django, o .NET (a definir)
- **Base de Datos**: PostgreSQL, MySQL o SQLite (según escala)
- **Autenticación**: JWT o Session-based
- **Respaldos**: Sistema automático diario con rotación de versiones

### 4.2 Performance

- Tiempo de respuesta en búsquedas de productos: < 500ms
- Generación de reportes: < 3 segundos
- Transacciones de venta: < 1 segundo
- Máximo 10 usuarios concurrentes inicialmente

### 4.3 Datos y Almacenamiento

- Todas las transacciones deben almacenarse permanentemente (no se eliminan)
- Los cambios en productos se auditan (quién, cuándo, qué cambió)
- Respaldos diarios automáticos
- Retención mínima de datos: 2 años

### 4.4 Seguridad

- Contraseñas encriptadas (bcrypt o similar)
- Control de acceso por rol (RBAC - Role Based Access Control)
- Auditoría completa de operaciones
- Protección contra inyección SQL y XSS
- Sesiones con timeout de 30 minutos
- HTTPS obligatorio en producción

### 4.5 Integraciones Futuras (Out of scope actual)

- Impresoras de tickets
- Lectores de códigos de barras
- Sistemas de pago en línea
- Integraciones con contabilidad
- Múltiples sucursales

---

## 5. Requisitos No Funcionales

| Atributo | Descripción |
|----------|------------|
| Disponibilidad | 99% durante horario de operación (8 AM - 8 PM) |
| Escalabilidad | Debe soportar crecimiento a 50 productos, 1000 transacciones/mes inicialmente |
| Usabilidad | Interfaz intuitiva, con capacitación mínima (máx 2 horas) |
| Mantenibilidad | Código bien documentado, modular y versionado en Git |
| Compatibilidad | Navegadores: Chrome, Firefox, Safari (últimas 2 versiones) |
| Recuperabilidad | Tiempo para recuperación de fallo: < 1 hora |
| Compliance | Cumple con normativas locales de facturación (si aplica) |

---

## 6. Modelo de Datos (Conceptual)

### Entidades Principales

```
PRODUCTOS
├── id (PK)
├── código (único)
├── nombre
├── descripción
├── categoría
├── precio_venta
├── costo_unitario
├── stock_actual
├── stock_mínimo
├── estado (activo/inactivo)
├── fecha_creación
└── fecha_actualización

TRANSACCIONES (Ventas)
├── id (PK)
├── número_transacción (único)
├── usuario_id (FK)
├── fecha
├── hora
├── estado (completada/anulada)
├── total_antes_descuento
├── descuento
├── impuesto
├── total_final
└── forma_pago

DETALLE_TRANSACCIÓN
├── id (PK)
├── transacción_id (FK)
├── producto_id (FK)
├── cantidad
├── precio_unitario
└── subtotal

USUARIOS
├── id (PK)
├── nombre
├── correo (único)
├── usuario (único)
├── contraseña (encriptada)
├── rol (vendedor/gerente/administrador)
├── estado (activo/inactivo)
└── fecha_creación

MOVIMIENTOS_INVENTARIO
├── id (PK)
├── producto_id (FK)
├── tipo (entrada/salida)
├── cantidad
├── motivo
├── usuario_id (FK)
├── fecha
└── referencia (número compra/venta)

AUDITORIA
├── id (PK)
├── usuario_id (FK)
├── acción (crear/actualizar/eliminar)
├── tabla_afectada
├── registro_id
├── datos_antes
├── datos_después
├── fecha
└── ip_address

CIERRES_CAJA
├── id (PK)
├── fecha
├── usuario_id (FK)
├── total_ventas
├── efectivo_esperado
├── efectivo_contado
├── diferencia
├── estado
└── notas
```

---

## 7. Restricciones del Negocio

1. **Ventas**: Solo se pueden vender productos con stock > 0
2. **Precios**: No se permite vender a precio diferente al registrado (salvo descuento autorizado)
3. **Descuentos**: Máximo 50% en vendedores, sin límite en gerentes
4. **Cierre de caja**: Solo puede hacerlo gerente o administrador
5. **Anulaciones**: Solo en las últimas 24 horas desde la venta
6. **Productos eliminados**: Se marcan como inactivos, no se eliminan
7. **Auditoría**: Toda operación debe quedar registrada
8. **Respaldos**: Mínimo 7 versiones históricas

---

## 8. Criterios de Aceptación del Proyecto

- [ ] Todas las US implementadas y testeadas
- [ ] Documentación completa de API (si aplica)
- [ ] Pruebas unitarias con cobertura > 80%
- [ ] Manual de usuario finalizado
- [ ] Capacitación brindada al personal
- [ ] Datos de prueba cargados (mínimo 50 productos, 100 transacciones)
- [ ] Sistema en producción funcionando sin errores críticos

---

## 9. Próximas Fases (Post-MVP)

1. **Fase 2**: Integraciones (códigos de barras, impresoras)
2. **Fase 3**: Multi-sucursal
3. **Fase 4**: Móvil (consulta de inventario desde celular)
4. **Fase 5**: E-commerce básico

---

## Notas Adicionales

- Este documento es la base para estimación y planificación
- Pendiente definir: tecnología específica, timeline detallado, equipo de desarrollo
- Se recomienda una reunión con stakeholders para validar y priorizar historias de usuario
