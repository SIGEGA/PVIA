# Manual de Usuario — Sistema de Punto de Venta ITH

**Para:** Personal de caja y gerencia  
**Nivel:** Sin conocimientos técnicos necesarios  
**Versión:** 1.0 — Julio 2026

---

## Contenido

1. [Cómo iniciar sesión](#1-cómo-iniciar-sesión)
2. [Conoce la pantalla principal](#2-conoce-la-pantalla-principal)
3. [Cómo registrar una venta](#3-cómo-registrar-una-venta)
   - [Buscar un producto](#31-buscar-un-producto)
   - [Revisar y ajustar el carrito](#32-revisar-y-ajustar-el-carrito)
   - [Aplicar un descuento](#33-aplicar-un-descuento-opcional)
   - [Cobrar la venta](#34-cobrar-la-venta)
   - [Descargar el comprobante](#35-descargar-el-comprobante)
4. [Cómo realizar el corte de caja](#4-cómo-realizar-el-corte-de-caja)
   - [Generar la vista previa](#41-generar-la-vista-previa)
   - [Contar el efectivo y confirmar](#42-contar-el-efectivo-y-confirmar)
   - [Consultar cortes anteriores](#43-consultar-cortes-anteriores)
5. [Preguntas frecuentes](#5-preguntas-frecuentes)

---

## 1. Cómo iniciar sesión

Al abrir el sistema verás una pantalla con dos campos de texto.

1. Escribe tu **correo electrónico** en el primer campo.
2. Escribe tu **contraseña** en el segundo campo.
3. Haz clic en el botón **Iniciar sesión**.

Si tus datos son correctos, el sistema te llevará automáticamente al **Panel de control**.

> **¿Olvidaste tu contraseña?** Pide al administrador del sistema que te asigne una nueva. El sistema no tiene opción de recuperación por correo.

---

## 2. Conoce la pantalla principal

Después de iniciar sesión verás dos áreas principales:

```
┌──────────────┬────────────────────────────────────────────┐
│              │                                            │
│   MENÚ       │         CONTENIDO DE LA SECCIÓN           │
│  LATERAL     │                                            │
│              │                                            │
│ Panel de     │                                            │
│ control      │                                            │
│ Ventas       │                                            │
│ Inventario   │                                            │
│ ...          │                                            │
└──────────────┴────────────────────────────────────────────┘
```

**Menú lateral (barra izquierda):** aquí están todas las secciones del sistema. Haz clic en el nombre de la sección que quieras usar.

**Área principal (parte derecha):** muestra el contenido de la sección que seleccionaste.

En la esquina superior derecha verás **tu nombre y rol** (vendedor, gerente o administrador). Solo verás las secciones que corresponden a tu nivel de acceso.

---

## 3. Cómo registrar una venta

En el menú lateral, haz clic en **Ventas**.

La pantalla se divide en dos partes:
- **Izquierda:** buscador de productos y lista de lo que vas agregando (el carrito).
- **Derecha:** resumen del total y botón para cobrar.

---

### 3.1 Buscar un producto

1. Haz clic en el campo que dice **"Buscar producto por nombre o código..."**
2. Escribe al menos **2 letras** del nombre del producto, o su código de barras completo.
3. En menos de un segundo aparecerá una lista con los productos que coincidan.

   ```
   ┌──────────────────────────────────────────┐
   │ 🔍 Buscar producto por nombre o código   │
   ├──────────────────────────────────────────┤
   │ Manzana Roja kg                   $32.50 │
   │ Código: FRU-001 · Stock: 47.5            │
   ├──────────────────────────────────────────┤
   │ Manzana Verde kg                  $28.00 │
   │ Código: FRU-002 · Stock: 12              │
   └──────────────────────────────────────────┘
   ```

4. Haz clic sobre el producto que quieres agregar.
5. El producto aparecerá automáticamente en el carrito de abajo.
6. El campo de búsqueda se limpia solo para que puedas buscar el siguiente producto.

> **Producto en gris y sin poder seleccionarlo:** significa que está **agotado** (stock en cero). No es posible venderlo hasta que se reponga el inventario.

> **Tip:** También puedes buscar escribiendo el código de barras si tienes un lector conectado. Solo haz clic en el campo de búsqueda y pasa el lector — el código se escribirá automáticamente.

---

### 3.2 Revisar y ajustar el carrito

Cada producto que agregues aparecerá como una fila en la tabla del carrito:

| Producto | Cantidad | Precio | Subtotal | |
|----------|----------|--------|----------|-|
| Manzana Roja kg | `2` | $32.50 | $65.00 | ✕ |

- **Cambiar la cantidad:** haz clic en el número de la columna **Cantidad** y escribe la cantidad correcta. El subtotal se actualiza al instante.
- **Quitar un producto:** haz clic en la **✕** que aparece al final de la fila.
- **Vaciar todo el carrito:** haz clic en el botón **Limpiar carrito** (parte inferior derecha). Úsalo si cometiste un error y quieres empezar de cero.

---

### 3.3 Aplicar un descuento (opcional)

En el panel derecho, debajo de **Subtotal**, hay un campo llamado **Descuento ($)**.

1. Haz clic en ese campo.
2. Escribe el monto de descuento en pesos (por ejemplo: `20` para descontar $20.00).
3. El **Total** se actualizará automáticamente restando ese monto antes de calcular el impuesto.

> El descuento es sobre el total de la venta completa, no por producto individual.

---

### 3.4 Cobrar la venta

1. Cuando ya tengas todos los productos en el carrito, haz clic en el botón azul **Cobrar**.

   El botón muestra cuántos productos tienes: por ejemplo **"Cobrar (3 productos)"**.

2. Se abrirá una ventana llamada **"Registrar pago"** con el total a cobrar destacado en azul.

3. Elige el **método de pago** haciendo clic en uno de los tres botones:

   | Botón | Cuándo usarlo |
   |-------|---------------|
   | **Efectivo** | El cliente paga con billetes o monedas |
   | **Tarjeta** | Pago con tarjeta de crédito o débito |
   | **Transferencia** | Pago por SPEI u otra transferencia |

4. **Si elegiste Efectivo:**
   - Aparecerá el campo **"Monto recibido ($)"**.
   - Escribe la cantidad de dinero que te dio el cliente (por ejemplo: `200` si te dio un billete de $200).
   - El sistema calculará automáticamente el **Vuelto** y lo mostrará en verde.

   ```
   ┌─────────────────────────────────┐
   │ Total a cobrar        $113.10   │
   ├─────────────────────────────────┤
   │ Monto recibido ($)    [200.00]  │
   │                                 │
   │ Vuelto              $86.90  ✓   │
   └─────────────────────────────────┘
   ```

   > Si escribes un monto menor al total, el botón de confirmar se bloqueará y verás el mensaje **"Monto insuficiente"** en rojo.

5. Haz clic en **Confirmar pago**.

6. El sistema registra la venta, descuenta el stock automáticamente y muestra el mensaje **"¡Venta completada!"** con el número de folio.

---

### 3.5 Descargar el comprobante

Después de confirmar el pago, aparece la ventana del comprobante con el resumen de la venta.

Tienes dos opciones:

- **Descargar PDF** — descarga un archivo con el folio, fecha, productos, total y cambio entregado. Guárdalo o imprímelo si el cliente lo necesita.
- **Nueva venta** — cierra el comprobante y limpia el carrito para que puedas atender al siguiente cliente.

---

## 4. Cómo realizar el corte de caja

> Esta sección solo está disponible para usuarios con rol **gerente** o **administrador**.

El corte de caja se hace **una vez al día**, normalmente al cierre del turno. Su objetivo es verificar que el dinero en efectivo en la caja coincida con las ventas registradas en el sistema.

En el menú lateral haz clic en **Corte de caja**.

Verás dos pestañas: **Nuevo cierre** e **Historial**. Empieza en la pestaña **Nuevo cierre**.

---

### 4.1 Generar la vista previa

1. Haz clic en el botón azul **"Generar vista previa — [fecha de hoy]"**.
2. El sistema consultará todas las ventas del día y mostrará un cuadro azul con el resumen:

   ```
   Resumen de ventas del día
   ─────────────────────────
   Efectivo           $1,800.00
   Tarjeta            $1,200.00
   Transferencia        $450.00
   ─────────────────────────
   Total de ventas    $3,450.00
   ```

   Esto es el dinero que **debería** haber: lo que el sistema registró durante el día.

---

### 4.2 Contar el efectivo y confirmar

3. Cuenta físicamente los billetes y monedas que hay en la caja.
4. Escribe esa cantidad en el campo **"Efectivo contado físicamente ($)"**.

   En cuanto escribas un número, el sistema calculará automáticamente la diferencia y te mostrará si hay:

   - **Sobrante** (en verde) — hay más efectivo del esperado.
   - **Faltante** (en rojo) — hay menos efectivo del esperado.

   ```
   Efectivo contado:  [1,850.00]

   ┌─────────────────────────────┐
   │  Sobrante         +$50.00   │  ← en verde
   └─────────────────────────────┘
   ```

   > Una diferencia pequeña (sobrante o faltante de unos pocos pesos) puede deberse a redondeo en cambios. Si la diferencia es grande, revisa si hay ventas no registradas o dinero fuera de la caja.

5. Cuando estés listo, haz clic en **Confirmar cierre de caja**.

6. El sistema guardará el corte y **descargará automáticamente un PDF** con el nombre `cierre-[fecha].pdf`. Guárdalo para tus registros.

> Una vez confirmado el cierre, **no puede modificarse**. Si necesitas hacer correcciones, contacta al administrador.

---

### 4.3 Consultar cortes anteriores

1. En la misma página de **Corte de caja**, haz clic en la pestaña **Historial**.
2. Verás una tabla con todos los cortes realizados: fecha, total de ventas, efectivo esperado, efectivo contado y diferencia.
3. Puedes revisar cualquier corte anterior haciendo clic sobre él.

---

## 5. Preguntas frecuentes

**¿Qué pasa si agrego el producto equivocado al carrito?**  
Haz clic en la **✕** que aparece al final de la fila de ese producto para eliminarlo del carrito. La venta todavía no se ha registrado, así que no hay problema.

---

**¿Puedo agregar el mismo producto dos veces?**  
No es necesario. Si un producto ya está en el carrito y lo buscas y seleccionas de nuevo, el sistema sumará una unidad más a la cantidad existente.

---

**¿Qué hago si el sistema dice "Stock insuficiente"?**  
Significa que intentas vender más unidades de las que hay en almacén. Verifica la cantidad real del producto y ajusta la cantidad en el carrito, o registra una entrada de inventario antes de continuar.

---

**¿Puedo cancelar una venta ya registrada?**  
Sí, pero solo los usuarios con rol **gerente** o **administrador** pueden hacerlo, y es necesario escribir un motivo. La cancelación restaura el stock de los productos. Consulta a tu gerente si necesitas cancelar una venta.

---

**¿Qué significa el número en el Panel de control?**  
El Panel de control muestra un resumen del día: ventas totales, número de transacciones, productos con stock bajo y más. Es solo para consulta — no se puede modificar nada desde ahí.

---

**No puedo ver la sección de Corte de caja ni Reportes.**  
Esas secciones requieren rol de **gerente** o **administrador**. Si necesitas acceso, pide al administrador que actualice tu perfil.

---

**El sistema cerró mi sesión solo. ¿Qué hago?**  
Por seguridad, la sesión expira después de 8 horas de inactividad. Simplemente vuelve a iniciar sesión con tu correo y contraseña.

---

*Para soporte técnico, contacta al área de sistemas del ITH.*
