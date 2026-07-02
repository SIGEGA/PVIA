# Diagrama Entidad-Relación (ER) - Sistema POS Abarrotes y Frutería

## Mermaid ER Diagram

```mermaid
erDiagram
    EMPRESAS ||--o{ SUCURSALES : tiene
    EMPRESAS ||--o{ USUARIOS : administra
    EMPRESAS ||--o{ PRODUCTOS : posee
    EMPRESAS ||--o{ CLIENTES : atiende
    EMPRESAS ||--o{ PROVEEDORES : gestiona
    EMPRESAS ||--o{ VENTAS : registra
    EMPRESAS ||--o{ COMPRAS : registra
    EMPRESAS ||--o{ GASTOS : registra
    EMPRESAS ||--o{ CORTE_CAJA : controla
    EMPRESAS ||--o{ AUDITORIA : audita

    SUCURSALES ||--o{ USUARIOS : asigna
    SUCURSALES ||--o{ PRODUCTOS : posee
    SUCURSALES ||--o{ CLIENTES : atiende
    SUCURSALES ||--o{ PROVEEDORES : gestiona
    SUCURSALES ||--o{ VENTAS : registra
    SUCURSALES ||--o{ COMPRAS : registra
    SUCURSALES ||--o{ GASTOS : registra
    SUCURSALES ||--o{ CORTE_CAJA : controla
    SUCURSALES ||--o{ MOVIMIENTO_INVENTARIO : maneja

    USUARIOS ||--o{ VENTAS : realiza
    USUARIOS ||--o{ COMPRAS : registra
    USUARIOS ||--o{ GASTOS : registra
    USUARIOS ||--o{ CORTE_CAJA : realiza
    USUARIOS ||--o{ AUDITORIA : ejecuta

    PRODUCTOS ||--o{ DETALLE_VENTA : contiene
    PRODUCTOS ||--o{ DETALLE_COMPRA : contiene
    PRODUCTOS ||--o{ MOVIMIENTO_INVENTARIO : afecta

    VENTAS ||--o{ DETALLE_VENTA : tiene
    COMPRAS ||--o{ DETALLE_COMPRA : tiene
    CLIENTES ||--o{ VENTAS : realiza
    PROVEEDORES ||--o{ COMPRAS : suministra
    CATEGORIAS ||--o{ PRODUCTOS : clasifica

    EMPRESAS {
        int id PK
        string nombre
        string ruc_nit UK
        string direccion
        string telefono
        string email
        string ciudad
        string estado
        datetime fecha_creacion
    }

    SUCURSALES {
        int id PK
        int empresa_id FK
        string nombre
        string codigo_sucursal UK
        string direccion
        string telefono
        string ciudad
        string estado
        datetime fecha_creacion
    }

    USUARIOS {
        int id PK
        int empresa_id FK
        int sucursal_id FK
        string nombre
        string correo UK
        string usuario UK
        string contraseña
        enum rol "vendedor,gerente,administrador"
        enum estado "activo,inactivo"
        datetime fecha_creacion
    }

    CATEGORIAS {
        int id PK
        int empresa_id FK
        int sucursal_id FK
        string nombre UK
        string descripcion
        datetime fecha_creacion
    }

    PRODUCTOS {
        int id PK
        int empresa_id FK
        int sucursal_id FK
        string codigo UK
        string nombre
        string descripcion
        int categoria_id FK
        decimal precio_venta
        decimal costo_unitario
        decimal stock_actual
        int stock_minimo
        enum estado "activo,inactivo"
        datetime fecha_creacion
        datetime fecha_actualizacion
    }

    CLIENTES {
        int id PK
        int empresa_id FK
        int sucursal_id FK
        string nombre
        string documento
        string telefono
        string email
        string direccion
        enum tipo "normal,mayorista"
        enum estado "activo,inactivo"
        datetime fecha_creacion
    }

    VENTAS {
        int id PK
        int empresa_id FK
        int sucursal_id FK
        string numero_transaccion UK
        int usuario_id FK
        int cliente_id FK "nullable"
        datetime fecha
        datetime hora
        enum estado "completada,anulada,pendiente"
        decimal total_antes_descuento
        decimal descuento
        decimal porcentaje_descuento
        decimal impuesto
        decimal total_final
        enum forma_pago "efectivo,tarjeta,cheque,transferencia"
        string referencia_pago "nullable"
        text observaciones "nullable"
        datetime fecha_creacion
    }

    DETALLE_VENTA {
        int id PK
        int venta_id FK
        int producto_id FK
        decimal cantidad
        decimal precio_unitario
        decimal subtotal
        decimal descuento_item "nullable"
    }

    PROVEEDORES {
        int id PK
        int empresa_id FK
        int sucursal_id FK
        string nombre UK
        string contacto
        string telefono
        string email
        string direccion
        string ciudad
        string ruc_nit "nullable"
        enum estado "activo,inactivo"
        datetime fecha_creacion
    }

    COMPRAS {
        int id PK
        int empresa_id FK
        int sucursal_id FK
        string numero_compra UK
        int proveedor_id FK
        int usuario_id FK
        datetime fecha
        decimal total_antes_impuesto
        decimal impuesto
        decimal total_final
        enum estado "pendiente,recibida,cancelada"
        text observaciones "nullable"
        datetime fecha_creacion
    }

    DETALLE_COMPRA {
        int id PK
        int compra_id FK
        int producto_id FK
        decimal cantidad
        decimal costo_unitario
        decimal subtotal
        string numero_lote "nullable"
        date fecha_vencimiento "nullable"
    }

    MOVIMIENTO_INVENTARIO {
        int id PK
        int empresa_id FK
        int sucursal_id FK
        int producto_id FK
        enum tipo "entrada,salida,ajuste"
        decimal cantidad
        string motivo
        int usuario_id FK
        datetime fecha
        string referencia "nullable"
        text observaciones "nullable"
    }

    GASTOS {
        int id PK
        int empresa_id FK
        int sucursal_id FK
        string numero_gasto UK
        int usuario_id FK
        enum categoria "servicios,mantenimiento,suministros,otros"
        decimal monto
        text descripcion
        datetime fecha
        enum estado "registrado,pagado"
        string referencia "nullable"
        datetime fecha_creacion
    }

    CORTE_CAJA {
        int id PK
        int empresa_id FK
        int sucursal_id FK
        int usuario_id FK
        date fecha
        decimal total_ventas
        decimal total_efectivo_esperado
        decimal total_efectivo_contado
        decimal diferencia_efectivo
        decimal total_tarjeta
        decimal total_cheque
        decimal total_transferencia
        decimal total_general
        enum estado "abierto,cerrado"
        text observaciones "nullable"
        datetime fecha_apertura
        datetime fecha_cierre "nullable"
    }

    AUDITORIA {
        int id PK
        int empresa_id FK
        int sucursal_id FK
        int usuario_id FK
        enum accion "crear,actualizar,eliminar,consultar"
        string tabla_afectada
        int registro_id
        text datos_antes "nullable"
        text datos_despues "nullable"
        datetime fecha
        string ip_address "nullable"
        string navegador "nullable"
    }
```

---

## Descripción de Relaciones

| Relación | Descripción |
|----------|------------|
| EMPRESAS → SUCURSALES | Una empresa tiene múltiples sucursales |
| SUCURSALES → USUARIOS | Una sucursal tiene múltiples usuarios |
| SUCURSALES → PRODUCTOS | Cada sucursal gestiona su inventario |
| SUCURSALES → VENTAS | Cada venta pertenece a una sucursal |
| SUCURSALES → COMPRAS | Cada compra se registra en una sucursal |
| SUCURSALES → GASTOS | Cada gasto se reporta por sucursal |
| USUARIOS → VENTAS | Un usuario realiza múltiples ventas |
| PRODUCTOS → DETALLE_VENTA | Un producto aparece en múltiples detalles de ventas |
| PRODUCTOS → DETALLE_COMPRA | Un producto aparece en múltiples detalles de compras |
| CLIENTES → VENTAS | Un cliente realiza múltiples ventas |
| PROVEEDORES → COMPRAS | Un proveedor suministra múltiples compras |
| CATEGORIAS → PRODUCTOS | Una categoría clasifica múltiples productos |

---

## Consideraciones de Diseño

### Llaves Primarias
- Todas las tablas tienen un `id` auto-incremental como PK.
- Se utiliza `SERIAL` en PostgreSQL.

### Llaves Foráneas (FK)
- `empresa_id` y `sucursal_id` permiten controlar datos por empresa y sucursal.
- Se recomienda `ON DELETE RESTRICT` para evitar pérdida accidental de datos.

### Campos Únicos (UK)
- Códigos de productos, transacciones, compras y sucursales.
- Correos y usuarios únicos.
- Nombre de proveedores único.

### Campos Nullable
- Cliente en ventas cuando no se registra un cliente.
- Referencia de pago opcional.
- Observaciones y detalles opcionales.

### Auditoría
- La tabla `AUDITORIA` registra operaciones importantes por empresa y sucursal.
- Los campos `datos_antes` y `datos_despues` pueden guardarse en JSON.

### Performance
- Índices se recomiendan en las claves foráneas y campos de búsqueda frecuente.
- Se recomienda un índice compuesto por `(sucursal_id, fecha)` para reportes.
