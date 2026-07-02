# Tasks Frontend - Sistema de Punto de Venta ITH

> Stack: React 18 + Vite 5 + TailwindCSS + Zustand + Axios + React Hook Form + Zod + Recharts + jsPDF  
> Convenciones: componentes en PascalCase, hooks con prefijo `use`, variables/funciones en inglés camelCase, comentarios en español, archivos en inglés con guión.

---

## FASE 0 — Configuración inicial

### F-001: Inicializar proyecto Vite + React

**Terminado cuando:**
```
Given el desarrollador ejecuta: npm create vite@latest frontend -- --template react
When entra a la carpeta e instala dependencias con npm install
Then el servidor corre con npm run dev en http://localhost:5173
And la página muestra el starter de Vite sin errores en consola
```

---

### F-002: Instalar y configurar TailwindCSS

**Terminado cuando:**
```
Given el proyecto Vite está inicializado
When instala: npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p
And configura tailwind.config.js con content: ["./index.html","./src/**/*.{js,jsx}"]
And agrega las directivas @tailwind al index.css
Then una clase como className="text-blue-500" aplica el color correctamente en el navegador
```

---

### F-003: Instalar dependencias del proyecto

**Terminado cuando:**
```
Given el proyecto tiene Tailwind configurado
When ejecuta: npm install react-router-dom zustand axios react-hook-form zod @hookform/resolvers recharts date-fns jspdf jspdf-autotable
Then el package.json lista todas las dependencias sin errores de resolución
And npm run dev arranca sin warnings de peer dependencies
```

---

### F-004: Configurar variables de entorno

**Terminado cuando:**
```
Given existe un archivo .env en la raíz de frontend/
When define: VITE_API_URL=http://localhost:3001/api
Then import.meta.env.VITE_API_URL retorna la URL correcta en cualquier componente
And el archivo .env no está trackeado en git (.gitignore lo excluye)
And existe .env.example con las claves sin valores
```

---

### F-005: Crear estructura de carpetas base

**Terminado cuando:**
```
Given el proyecto Vite está inicializado
When crea todas las carpetas: src/components/ui, src/components/layout,
  src/features/, src/hooks/, src/pages/, src/routes/,
  src/services/, src/store/, src/utils/
Then cada carpeta existe con al menos un archivo índice o .gitkeep
And la estructura refleja exactamente el plan.md sección 3.2
```

---

## FASE 1 — Infraestructura base

### F-006: Crear instancia Axios con interceptores (api.js)

**Terminado cuando:**
```
Given existe VITE_API_URL en .env
When se importa api desde src/services/api.js
Then la instancia tiene baseURL apuntando a VITE_API_URL
And el interceptor de request adjunta automáticamente el header
  Authorization: Bearer <token> si existe en localStorage
And el interceptor de response detecta 401 y redirige a /login
```

---

### F-007: Crear componente Button.jsx

**Terminado cuando:**
```
Given se usa <Button variant="primary">Guardar</Button>
Then renderiza un botón con estilos de Tailwind diferenciados por variante:
  primary (azul), secondary (gris), danger (rojo), ghost (transparente)
And acepta prop disabled que deshabilita visualmente y funcionalmente el botón
And acepta prop loading que muestra un spinner en lugar del texto
```

---

### F-008: Crear componente Input.jsx

**Terminado cuando:**
```
Given se usa <Input label="Nombre" error="Campo requerido" {...register("nombre")} />
Then muestra el label encima del campo
And si error tiene valor, muestra el mensaje en rojo debajo del campo
And el borde del input cambia a rojo cuando hay error
And funciona con React Hook Form sin configuración extra
```

---

### F-009: Crear componente Modal.jsx

**Terminado cuando:**
```
Given se usa <Modal isOpen={true} onClose={handleClose} title="Confirmar">
Then renderiza un overlay oscuro sobre el contenido de la página
And muestra el título y el children en el centro de la pantalla
And al hacer clic en la X o en el overlay se llama onClose
And la tecla Escape también cierra el modal
```

---

### F-010: Crear componente DataTable.jsx

**Terminado cuando:**
```
Given se pasan props: columns (array de {key, label}) y data (array de objetos)
Then renderiza una tabla HTML con encabezados y filas correspondientes
And muestra "Sin resultados" cuando data está vacío
And acepta prop actions para renderizar botones de acción en cada fila
And es responsivo: en mobile hace scroll horizontal
```

---

### F-011: Crear componente Toast.jsx (notificaciones)

**Terminado cuando:**
```
Given se llama showToast("Producto guardado", "success")
Then aparece una notificación en la esquina superior derecha
And desaparece automáticamente después de 3 segundos
And los tipos success, error, warning tienen colores distintos (verde, rojo, amarillo)
```

---

### F-012: Crear layout Sidebar.jsx + Header.jsx

**Terminado cuando:**
```
Given el usuario está autenticado
When navega a cualquier ruta protegida
Then el Sidebar muestra los ítems de menú correspondientes a su rol:
  vendedor ve: Ventas, Inventario, Productos
  gerente ve: todo lo anterior + Compras, Reportes, Cierre de Caja
  administrador ve: todo lo anterior + Usuarios, Configuración, Auditoría
And el Header muestra: nombre del usuario, rol y botón de Cerrar sesión
And el ítem activo en el Sidebar se resalta visualmente
```

---

### F-013: Crear ProtectedRoute.jsx

**Terminado cuando:**
```
Given un usuario no autenticado intenta acceder a /products
Then es redirigido automáticamente a /login
And al hacer login exitoso regresa a la ruta que intentaba visitar

Given un usuario con rol "vendedor" intenta acceder a /reports
Then es redirigido a /dashboard con mensaje "Sin permisos para esta sección"
```

---

### F-014: Configurar AppRouter.jsx

**Terminado cuando:**
```
Given AppRouter está montado en App.jsx
Then las rutas públicas (/login) no requieren autenticación
And todas las rutas privadas están envueltas en ProtectedRoute
And cada ruta privada especifica los roles permitidos
And la ruta /* redirige a /dashboard o muestra página 404
```

---

## FASE 2 — Autenticación

### F-015: Crear authStore.js con Zustand

**Terminado cuando:**
```
Given se importa useAuthStore desde src/store/authStore.js
Then expone: user, token, isAuthenticated, login(userData, token), logout()
And login() guarda el token en localStorage y actualiza el estado
And logout() limpia localStorage y resetea el estado
And al recargar la página, el store se rehidrata desde localStorage
```

---

### F-016: Crear auth.service.js

**Terminado cuando:**
```
Given se llama loginUser({ email, password })
Then hace POST a /api/usuarios/login con el body correcto
And si la respuesta es { success: true, data: { token, user } } retorna los datos
And si la respuesta es { success: false } lanza un Error con el mensaje del servidor
```

---

### F-017: Crear LoginPage.jsx + LoginForm.jsx

**Terminado cuando:**
```
Given el usuario abre http://localhost:5173/login
Then ve un formulario centrado con: logo/nombre del sistema, campo email, campo password, botón "Entrar"

Given ingresa email y contraseña válidos y hace clic en Entrar
Then el botón muestra spinner mientras espera la respuesta
And al recibir respuesta exitosa redirige a /dashboard

Given ingresa credenciales incorrectas
Then muestra alerta roja con el mensaje de error del servidor
And los campos no se limpian para que pueda corregir
```

---

### F-018: Crear hook useAuth.js

**Terminado cuando:**
```
Given se usa const { user, isAuthenticated, hasRole } = useAuth()
Then user retorna el objeto del usuario logueado o null
And isAuthenticated retorna true/false
And hasRole("gerente") retorna true si el usuario tiene ese rol o superior
```

---

### F-019: Implementar logout

**Terminado cuando:**
```
Given el usuario está logueado y hace clic en "Cerrar sesión" en el Header
Then se llama authStore.logout()
And se limpia el token de localStorage
And se redirige a /login
And si intenta navegar hacia atrás, es redirigido a /login
```

---

## FASE 3 — Dashboard

### F-020: Crear DashboardPage.jsx

**Terminado cuando:**
```
Given el usuario está autenticado y navega a /dashboard
Then ve tarjetas con métricas del día:
  - Total de ventas del día (suma de ventas con fecha = hoy)
  - Número de transacciones
  - Productos con stock bajo (contador)
And cada tarjeta muestra un ícono y el valor numérico formateado
And los datos se cargan desde la API al montar la página
```

---

### F-021: Crear widget LowStockAlert en Dashboard

**Terminado cuando:**
```
Given el dashboard está cargado
Then si hay productos con stock ≤ stock_minimo, aparece una sección "Alertas de stock"
And lista hasta 5 productos con nombre, stock actual y stock mínimo
And hay un enlace "Ver todos" que lleva a /inventory con filtro lowStock=true

Given no hay productos con stock bajo
Then la sección de alertas no aparece o muestra "Sin alertas de stock"
```

---

## FASE 4 — Módulo Productos

### F-022: Crear products.service.js

**Terminado cuando:**
```
Given se importa { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductByCode } desde products.service.js
Then cada función hace la llamada HTTP correcta a /api/productos
And todas retornan la propiedad data de la respuesta del servidor
And los errores de API se propagan como excepciones para ser capturadas en el componente
```

---

### F-023: Crear hook useProducts.js

**Terminado cuando:**
```
Given se usa const { products, loading, error, refetch } = useProducts()
Then products contiene el array de productos de la API
And loading es true mientras se espera la respuesta
And error contiene el mensaje si la petición falló
And refetch() vuelve a cargar los productos desde la API
```

---

### F-024: Crear ProductsPage.jsx

**Terminado cuando:**
```
Given el usuario navega a /products
Then ve una tabla con columnas: código, nombre, precio venta, stock, categoría, acciones
And hay un buscador en la parte superior que filtra por nombre o código
And hay un botón "Nuevo producto" visible solo para gerente/administrador
And las acciones por fila incluyen: Editar (todos), Eliminar (solo administrador)
```

---

### F-025: Crear ProductForm.jsx (crear y editar)

**Terminado cuando:**
```
Given el usuario hace clic en "Nuevo producto"
Then se abre un Modal con el formulario vacío con campos:
  código, nombre, descripción, precio venta, precio compra, stock inicial, stock mínimo, categoría

Given completa el formulario y hace clic en Guardar
Then se valida con Zod: código requerido, nombre requerido, precio > 0
And si es válido, hace POST a /api/productos y cierra el modal
And la tabla se actualiza automáticamente con el nuevo producto
And aparece toast "Producto creado correctamente"

Given abre editar un producto existente
Then el formulario aparece pre-llenado con los datos actuales
And el campo código está deshabilitado con tooltip "El código no puede modificarse"
And al guardar hace PUT a /api/productos/:id
```

---

### F-026: Confirmar eliminación de producto

**Terminado cuando:**
```
Given el usuario hace clic en "Eliminar" en un producto
Then aparece un Modal de confirmación: "¿Seguro que desea eliminar [nombre]?"
And hay dos botones: "Cancelar" y "Sí, eliminar"

Given confirma la eliminación
Then hace DELETE a /api/productos/:id
And el producto desaparece de la tabla
And aparece toast "Producto eliminado"

Given el servidor responde 409
Then muestra el mensaje de error del servidor ("No se puede eliminar producto con historial de ventas")
```

---

### F-027: Indicador visual de stock bajo en tabla

**Terminado cuando:**
```
Given la tabla de productos está cargada
When un producto tiene stock <= stock_minimo
Then la celda de stock se muestra en color rojo con ícono de advertencia

Given el producto tiene stock = 0
Then la celda muestra "Agotado" en rojo con fondo rosado
```

---

## FASE 5 — Módulo Ventas (POS)

### F-028: Crear saleStore.js con Zustand

**Terminado cuando:**
```
Given se importa useSaleStore
Then expone:
  - items: array de productos en el carrito
  - addItem(product, cantidad): agrega o incrementa cantidad
  - removeItem(productId): elimina el ítem del carrito
  - updateQuantity(productId, cantidad): actualiza la cantidad
  - clearCart(): vacía el carrito
  - subtotal, impuestos, descuento, total: calculados automáticamente
  - metodo_pago, montoPagado, cambio: estado del pago
```

---

### F-029: Crear sales.service.js

**Terminado cuando:**
```
Given se importan las funciones del servicio
Then createSale(saleData) hace POST a /api/ventas con el body correcto
And getSales(filters) hace GET a /api/ventas con query params opcionales
And cancelSale(id, motivo) hace PATCH a /api/ventas/:id/cancel
```

---

### F-030: Crear SalesPage.jsx (layout POS)

**Terminado cuando:**
```
Given el usuario navega a /sales
Then ve el layout dividido en dos columnas:
  - Izquierda: buscador de productos + tabla del carrito (SaleCart)
  - Derecha: resumen de totales + botón "Cobrar"
And el layout es visible y funcional en pantallas de 1024px en adelante
```

---

### F-031: Crear buscador de productos en ventas

**Terminado cuando:**
```
Given el vendedor escribe en el campo de búsqueda del POS
When escribe al menos 2 caracteres
Then aparece un dropdown con los productos que coinciden (nombre o código)
And cada resultado muestra: nombre, precio y stock disponible
And los productos con stock = 0 aparecen deshabilitados

Given hace clic en un producto del dropdown
Then se agrega al carrito con cantidad 1
And el campo de búsqueda se limpia automáticamente
```

---

### F-032: Crear SaleCart.jsx

**Terminado cuando:**
```
Given hay productos en el carrito
Then la tabla muestra: nombre, precio unitario, cantidad, subtotal, botón eliminar
And la cantidad es un input editable en la tabla
And al cambiar la cantidad se recalcula el subtotal de ese ítem en tiempo real

Given el carrito está vacío
Then muestra mensaje "Agrega productos para iniciar la venta"
```

---

### F-033: Calcular totales en tiempo real

**Terminado cuando:**
```
Given hay ítems en el carrito
Then el panel derecho muestra en tiempo real:
  Subtotal: $XXX.XX
  Descuento: $XXX.XX
  Total: $XXX.XX
And todos los valores usan formato de moneda mexicana ($1,234.56)
And al cambiar cualquier cantidad o eliminar un ítem, los totales se actualizan inmediatamente
```

---

### F-034: Aplicar descuento a la venta

**Terminado cuando:**
```
Given hay productos en el carrito
When el usuario hace clic en "Aplicar descuento"
Then aparece un campo para ingresar el monto o porcentaje de descuento

Given ingresa 10 como porcentaje
Then el descuento se calcula sobre el subtotal y se muestra en el resumen
And el total se actualiza

Given intenta ingresar un valor mayor a 50%
Then muestra error: "Descuento máximo permitido: 50%"
```

---

### F-035: Crear PaymentModal.jsx

**Terminado cuando:**
```
Given el usuario hace clic en "Cobrar"
Then se abre un modal con:
  - Total a cobrar
  - Selector de método de pago: efectivo, tarjeta, transferencia
  - Si elige efectivo: campo "Monto recibido" y cálculo automático de vuelto

Given el monto recibido es menor al total
Then el botón "Confirmar pago" permanece deshabilitado
And muestra "Monto insuficiente" en rojo

Given confirma el pago
Then hace POST a /api/ventas con todos los datos del carrito
And si la respuesta es exitosa, cierra el modal y vacía el carrito
And muestra ReceiptViewer con el comprobante
```

---

### F-036: Crear ReceiptViewer.jsx (comprobante PDF)

**Terminado cuando:**
```
Given se completó una venta exitosamente
Then se muestra el comprobante con:
  - Folio de la venta (VTA-YYMMDD-XXXX)
  - Fecha y hora
  - Lista de productos: nombre, cantidad, precio, subtotal
  - Subtotal, descuento, total
  - Método de pago, monto pagado, vuelto (si aplica)

Given el usuario hace clic en "Descargar PDF"
Then se genera y descarga un PDF usando jsPDF con toda la información anterior
And el archivo se llama recibo-[folio].pdf

Given hace clic en "Nueva venta"
Then el modal se cierra y el carrito queda vacío listo para la siguiente venta
```

---

### F-037: Historial de ventas del día

**Terminado cuando:**
```
Given el usuario navega a la pestaña "Historial" dentro de /sales
Then ve una tabla con las ventas del día: folio, hora, total, método pago, estado
And puede buscar por folio
And las ventas canceladas aparecen tachadas o con badge "Cancelada"

Given hace clic en una venta
Then ve el detalle completo de esa venta
And si el rol es gerente/admin, aparece botón "Cancelar venta"
```

---

## FASE 6 — Módulo Inventario

### F-038: Crear inventory.service.js

**Terminado cuando:**
```
Given se importan las funciones del servicio
Then getMovements(filters) hace GET a /api/inventario con filtros opcionales
And getLowStock() hace GET a /api/inventario/low-stock
And createMovement(data) hace POST a /api/inventario/movimientos
```

---

### F-039: Crear hook useInventory.js

**Terminado cuando:**
```
Given se usa const { movements, lowStockProducts, loading } = useInventory()
Then movements contiene el historial de movimientos
And lowStockProducts contiene productos bajo mínimo
And loading refleja el estado de la petición en curso
```

---

### F-040: Crear InventoryPage.jsx

**Terminado cuando:**
```
Given el usuario navega a /inventory
Then ve dos pestañas: "Movimientos" y "Stock bajo"
And en Movimientos: tabla con fecha, producto, tipo (entrada/salida/ajuste), cantidad, motivo
And en Stock bajo: tabla con productos cuyo stock <= stock_minimo
And hay filtros de fecha y tipo de movimiento en la pestaña de Movimientos
```

---

### F-041: Crear StockEntryForm.jsx (entrada de stock)

**Terminado cuando:**
```
Given el usuario hace clic en "Registrar entrada"
Then se abre un Modal con: buscador de producto, campo cantidad, campo motivo

Given busca y selecciona un producto y llena la cantidad
And hace clic en Guardar
Then hace POST a /api/inventario/movimientos con tipo "entrada"
And la tabla de movimientos se actualiza
And aparece toast "Entrada de stock registrada"

Given ingresa cantidad 0 o negativa
Then muestra error de validación: "La cantidad debe ser mayor a 0"
```

---

### F-042: Crear StockExitForm.jsx (salida/ajuste de stock)

**Terminado cuando:**
```
Given el usuario hace clic en "Registrar salida"
Then se abre un Modal con: buscador de producto, tipo (merma/donación/devolución), cantidad, motivo

Given selecciona producto con stock=5 e ingresa cantidad=10
Then muestra error: "Cantidad excede el stock disponible (5)"
And no permite guardar

Given ingresa datos válidos y guarda
Then hace POST a /api/inventario/movimientos con tipo "salida"
And el stock del producto se reduce en la API
```

---

## FASE 7 — Módulo Compras

### F-043: Crear purchases.service.js

**Terminado cuando:**
```
Given se importan las funciones del servicio
Then getPurchases(filters) hace GET a /api/compras
And createPurchase(data) hace POST a /api/compras
And cancelPurchase(id) hace PATCH a /api/compras/:id/cancel
```

---

### F-044: Crear PurchasesPage.jsx

**Terminado cuando:**
```
Given el usuario navega a /purchases
Then ve tabla con: folio, fecha, proveedor, total, estado
And hay filtros de fecha y proveedor
And botón "Nueva compra" visible para gerente/admin

Given hace clic en una compra
Then ve el detalle: lista de productos comprados con cantidad y precio unitario
```

---

### F-045: Crear PurchaseForm.jsx

**Terminado cuando:**
```
Given el usuario hace clic en "Nueva compra"
Then ve un formulario con: proveedor (select), fecha, notas
And una sección para agregar productos: buscador, cantidad, precio unitario
And muestra subtotal, impuestos (16%) y total calculados automáticamente

Given agrega al menos un producto y confirma
Then hace POST a /api/compras con todos los datos
And el stock de los productos se incrementa
And aparece toast "Compra registrada exitosamente"
```

---

## FASE 8 — Módulo Cierre de Caja

### F-046: Crear cashclose.service.js

**Terminado cuando:**
```
Given se importan las funciones del servicio
Then getPreview(fecha) hace GET a /api/corte-caja/preview/:fecha
And createCashClose(data) hace POST a /api/corte-caja
And getCashCloseHistory() hace GET a /api/corte-caja
```

---

### F-047: Crear CashClosePage.jsx

**Terminado cuando:**
```
Given el usuario navega a /cashclose
Then ve dos secciones: "Realizar cierre" y "Historial de cierres"
And en "Realizar cierre" hay un botón "Generar vista previa" para la fecha de hoy
And en "Historial" hay una tabla con: fecha, total ventas, efectivo, diferencia, estado
```

---

### F-048: Crear CashCloseForm.jsx

**Terminado cuando:**
```
Given el usuario hace clic en "Generar vista previa"
Then hace GET al preview y muestra el resumen calculado:
  - Total ventas por método de pago (efectivo, tarjeta, transferencia)
  - Total general

And aparece campo "Efectivo contado" para que el cajero ingrese el dinero físico
And se calcula automáticamente la diferencia: efectivo contado - efectivo esperado
And diferencia positiva se muestra en verde (sobrante), negativa en rojo (faltante)

Given confirma el cierre
Then hace POST a /api/corte-caja
And muestra mensaje de éxito y ofrece descargar PDF del cierre
And el botón "Realizar cierre de hoy" queda deshabilitado
```

---

### F-049: Generar PDF del cierre de caja

**Terminado cuando:**
```
Given se completó el cierre de caja
Then hay botón "Descargar PDF"
When hace clic
Then genera un PDF con jsPDF que incluye: fecha, totales por método de pago,
  efectivo esperado vs contado, diferencia, nombre del usuario que realizó el cierre
And el PDF se descarga como cierre-[fecha].pdf
```

---

## FASE 9 — Módulo Reportes

### F-050: Crear reports.service.js

**Terminado cuando:**
```
Given se importan las funciones del servicio
Then getDailySummary(fecha) hace GET a /api/reportes/daily-summary
And getSalesByPeriod(desde, hasta) hace GET a /api/reportes/sales-by-period
And getTopProducts(limit) hace GET a /api/reportes/top-products
And getInventoryValue() hace GET a /api/reportes/inventory-value
```

---

### F-051: Crear ReportsPage.jsx con navegación por tipo

**Terminado cuando:**
```
Given el usuario navega a /reports
Then ve pestañas para: Ventas, Inventario, Productos top
And el contenido cambia según la pestaña seleccionada
And cada pestaña tiene sus propios filtros de fecha
```

---

### F-052: Crear SalesReport.jsx

**Terminado cuando:**
```
Given el usuario está en la pestaña "Ventas"
When selecciona fecha inicio y fin y hace clic en "Generar"
Then muestra: total de transacciones, total en ventas, promedio por transacción
And una tabla con desglose por método de pago
And una gráfica de barras (Recharts) con ventas por día del período

Given no hay ventas en el período
Then muestra "Sin transacciones en este período"
```

---

### F-053: Crear InventoryReport.jsx

**Terminado cuando:**
```
Given el usuario está en la pestaña "Inventario"
Then muestra tabla con: código, nombre, stock actual, precio compra, valor total (stock × precio)
And muestra el valor total del inventario al pie
And hay filtro por categoría
And botón "Exportar PDF" que genera el reporte con jsPDF
```

---

### F-054: Crear top products chart

**Terminado cuando:**
```
Given el usuario está en la pestaña "Productos top"
Then muestra una gráfica de barras horizontales (Recharts) con los 10 productos más vendidos
And cada barra muestra el nombre del producto y la cantidad vendida
And debajo hay una tabla con: nombre, cantidad vendida, ingresos generados
```

---

## FASE 10 — Módulo Usuarios

### F-055: Crear UserManagement.jsx

**Terminado cuando:**
```
Given el administrador navega a /settings/users
Then ve tabla con: nombre, correo, rol, estado (activo/inactivo), acciones
And hay botón "Nuevo usuario"
And las acciones por fila incluyen: Editar, Cambiar contraseña, Activar/Desactivar
```

---

### F-056: Crear UserForm.jsx

**Terminado cuando:**
```
Given el administrador hace clic en "Nuevo usuario"
Then se abre Modal con campos: nombre, email, contraseña, rol (select)
And la validación Zod requiere: nombre no vacío, email válido, contraseña min 8 chars, rol válido

Given completa el formulario y guarda
Then hace POST a /api/usuarios
And si el email ya existe, muestra error "Correo ya registrado"
And si es exitoso, la tabla se actualiza y muestra toast de éxito
```

---

### F-057: Cambiar contraseña de usuario

**Terminado cuando:**
```
Given el administrador hace clic en "Cambiar contraseña" de un usuario
Then se abre Modal con campo "Nueva contraseña" (mínimo 8 caracteres)
And al confirmar hace PATCH a /api/usuarios/:id/password
And muestra toast "Contraseña actualizada"
```

---

### F-058: Activar / Desactivar usuario

**Terminado cuando:**
```
Given un usuario está activo y el admin hace clic en "Desactivar"
Then aparece confirmación "¿Desactivar a [nombre]?"
And al confirmar hace PATCH a /api/usuarios/:id/status con { activo: false }
And el badge del usuario cambia a "Inactivo"

Given el usuario está inactivo, aparece botón "Activar"
Then al confirmar hace PATCH con { activo: true }
```

---

## FASE 11 — Configuración y Auditoría

### F-059: Crear BusinessSettings.jsx

**Terminado cuando:**
```
Given el administrador navega a /settings
Then ve un formulario con los parámetros del negocio:
  nombre, dirección, teléfono, RFC, porcentaje IVA, límite de descuento
And los datos actuales aparecen pre-cargados
And al guardar muestra toast "Configuración actualizada"
```

---

### F-060: Crear AuditPage.jsx

**Terminado cuando:**
```
Given el administrador navega a /audit
Then ve una tabla con: fecha/hora, usuario, acción, detalles
And hay filtros por: usuario, rango de fechas
And la tabla tiene paginación (20 registros por página)

Given hace clic en un registro de la tabla
Then muestra un Modal con el detalle completo de la acción
```

---

## FASE 12 — Pulido y calidad

### F-061: Loading states globales

**Terminado cuando:**
```
Given cualquier página está cargando datos desde la API
Then muestra un skeleton loader o spinner centralizado
And los botones que disparan peticiones muestran spinner y se deshabilitan durante la carga
And no se produce doble submit por hacer clic rápido
```

---

### F-062: Manejo global de errores de API

**Terminado cuando:**
```
Given el interceptor de respuesta en api.js detecta un error
When el código es 401
Then limpia el store de auth y redirige a /login con mensaje "Sesión expirada"

When el código es 403
Then muestra toast de error "Sin permisos para esta acción"

When el código es 500
Then muestra toast "Error del servidor. Intente de nuevo"
And no expone el mensaje interno del servidor al usuario
```

---

### F-063: Validación de formularios con Zod

**Terminado cuando:**
```
Given cualquier formulario del sistema usa React Hook Form + Zod
Then los errores de validación aparecen debajo del campo correspondiente en español
And el formulario no se puede enviar mientras haya errores de validación
And los mensajes siguen el patrón definido en skill-ith-backend.md (claros y descriptivos)
```

---

### F-064: Formato de moneda y fechas

**Terminado cuando:**
```
Given cualquier valor monetario se muestra en pantalla
Then usa formatCurrency(amount) que retorna formato $1,234.56 (pesos mexicanos)

Given cualquier fecha se muestra en pantalla
Then usa formatDate(date) que retorna formato DD/MM/YYYY
And formatDateTime(date) retorna DD/MM/YYYY HH:mm
```

---

### F-065: Responsive básico (sidebar colapsable)

**Terminado cuando:**
```
Given el usuario abre la app en una pantalla < 768px
Then el Sidebar está oculto por defecto
And hay un botón de hamburguesa en el Header que lo muestra/oculta
And las tablas tienen scroll horizontal cuando el contenido no cabe
```

---

## Resumen de tareas

| Fase | Tareas | Descripción |
|------|--------|-------------|
| FASE 0 | F-001 a F-005 | Setup inicial |
| FASE 1 | F-006 a F-014 | Infraestructura base y componentes UI |
| FASE 2 | F-015 a F-019 | Autenticación |
| FASE 3 | F-020 a F-021 | Dashboard |
| FASE 4 | F-022 a F-027 | Módulo Productos |
| FASE 5 | F-028 a F-037 | Módulo Ventas POS |
| FASE 6 | F-038 a F-042 | Módulo Inventario |
| FASE 7 | F-043 a F-045 | Módulo Compras |
| FASE 8 | F-046 a F-049 | Módulo Cierre de Caja |
| FASE 9 | F-050 a F-054 | Módulo Reportes |
| FASE 10 | F-055 a F-058 | Módulo Usuarios |
| FASE 11 | F-059 a F-060 | Configuración y Auditoría |
| FASE 12 | F-061 a F-065 | Pulido y calidad |

**Total: 65 tareas atómicas**
