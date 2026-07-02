import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

// Muestra el comprobante de venta y permite descargar PDF
const ReceiptModal = ({ isOpen, onClose, sale, onNewSale }) => {
  if (!sale) return null;

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a5' });

    // Encabezado
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ITH Sistemas y Computación', 74, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema Punto de Venta', 74, 21, { align: 'center' });

    // Datos del folio
    doc.setFontSize(9);
    doc.text(`Folio: ${sale.folio}`, 15, 32);
    doc.text(`Fecha: ${formatDateTime(sale.created_at || new Date())}`, 15, 38);
    doc.text(`Método de pago: ${sale.metodo_pago || '—'}`, 15, 44);

    // Tabla de productos
    const rows = (sale.detalle || []).map((d) => [
      d.productos?.nombre || d.nombre || '—',
      d.cantidad,
      formatCurrency(d.precio_unitario),
      formatCurrency(d.subtotal),
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Producto', 'Cant.', 'Precio', 'Subtotal']],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    const y = doc.lastAutoTable.finalY + 6;
    doc.setFontSize(9);
    if (sale.descuento > 0) {
      doc.text(`Descuento: ${formatCurrency(sale.descuento)}`, 74, y, { align: 'center' });
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`TOTAL: ${formatCurrency(sale.total)}`, 74, y + 8, { align: 'center' });

    if (sale.cambio > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Cambio: ${formatCurrency(sale.cambio)}`, 74, y + 15, { align: 'center' });
    }

    doc.save(`recibo-${sale.folio}.pdf`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Venta registrada" size="sm">
      {/* Ícono de éxito */}
      <div className="text-center mb-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-900">¡Venta completada!</p>
        <p className="text-sm text-gray-500">Folio: {sale.folio}</p>
      </div>

      {/* Resumen */}
      <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-1 text-sm">
        {sale.descuento > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Descuento</span><span>- {formatCurrency(sale.descuento)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-gray-900 text-base">
          <span>Total</span><span>{formatCurrency(sale.total)}</span>
        </div>
        {sale.cambio > 0 && (
          <div className="flex justify-between text-green-700 font-medium">
            <span>Cambio entregado</span><span>{formatCurrency(sale.cambio)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={handleDownloadPDF} className="flex-1">
          Descargar PDF
        </Button>
        <Button onClick={onNewSale} className="flex-1">
          Nueva venta
        </Button>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
