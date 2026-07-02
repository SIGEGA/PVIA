const router = require('express').Router();

const userRoutes     = require('./user-routes');
const productRoutes  = require('./product-routes');
const saleRoutes     = require('./sale-routes');
const inventoryRoutes = require('./inventory-routes');
const cashcloseRoutes = require('./cashclose-routes');
const catalogRoutes  = require('./catalog-routes');
const purchaseRoutes = require('./purchase-routes');
const reportRoutes   = require('./report-routes');

// Autenticación y gestión de usuarios
router.use('/usuarios', userRoutes);

// Catálogos (categorías, unidades, proveedores, clientes)
router.use('/catalogos', catalogRoutes);

// Módulos principales
router.use('/productos',  productRoutes);
router.use('/ventas',     saleRoutes);
router.use('/inventario', inventoryRoutes);
router.use('/compras',    purchaseRoutes);
router.use('/corte-caja', cashcloseRoutes);

// Reportes
router.use('/reportes', reportRoutes);

module.exports = router;
