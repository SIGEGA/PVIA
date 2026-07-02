import { useState } from 'react';
import { getCashClosePreview, createCashClose } from '../../services/cashclose.service';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import useToast from '../../hooks/useToast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Formulario de cierre de caja: vista previa, conteo manual y confirmación
const CashCloseForm = ({ onSuccess }) => {
  const toast = useToast();
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [efectivoContado, setEfectivoContado] = useState('');
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Carga la vista previa del cierre de hoy
  const handlePreview = async () => {
    setLoadingPreview(true);
    try {
      const data = await getCashClosePreview(today);
      setPreview(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cargar la vista previa');
    } finally {
      setLoadingPreview(false);
    }
  };

  const efectivoEsperado = preview?.por_metodo?.efectivo || 0;
  const diferencia = parseFloat(efectivoContado || 0) - efectivoEsperado;

  // Confirma y guarda el cierre de caja
  const handleConfirm = async () => {
    setSaving(true);
    try {
      const result = await createCashClose({
        fecha: today,
        efectivo_contado: parseFloat(efectivoContado) || 0,
      });
      toast.success('Cierre de caja registrado');
      downloadPDF(result);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al registrar el cierre');
    } finally {
      setSaving(false);
    }
  };

  // Genera PDF del cierre de caja
  const downloadPDF = (data) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a5' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Cierre de Caja', 74, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${today}`, 74, 22, { align: 'center' });

    const rows = Object.entries(data.totales_por_metodo || {}).map(([metodo, monto]) => [
      metodo.charAt(0).toUpperCase() + metodo.slice(1),
      formatCurrency(monto),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Método de pago', 'Total']],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    const y = doc.lastAutoTable.finalY + 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total general: ${formatCurrency(data.total_ventas)}`, 74, y, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Efectivo contado: ${formatCurrency(data.efectivo_contado)}`, 74, y + 7, { align: 'center' });
    const diff = data.diferencia;
    doc.setTextColor(diff >= 0 ? 0 : 255, diff >= 0 ? 128 : 0, 0);
    doc.text(
      `Diferencia: ${diff >= 0 ? '+' : ''}${formatCurrency(diff)}`,
      74, y + 14, { align: 'center' }
    );
    doc.save(`cierre-${today}.pdf`);
  };

  return (
    <div className="space-y-5">
      {/* Botón para cargar la vista previa */}
      {!preview && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Genera la vista previa del día para iniciar el cierre.</p>
          <Button onClick={handlePreview} loading={loadingPreview} size="lg">
            Generar vista previa — {today}
          </Button>
        </div>
      )}

      {/* Vista previa cargada */}
      {preview && (
        <>
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Resumen de ventas del día</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(preview.por_metodo || {}).map(([metodo, monto]) => (
                <div key={metodo} className="flex justify-between text-gray-700">
                  <span className="capitalize">{metodo}</span>
                  <span className="font-medium">{formatCurrency(monto)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-gray-900 border-t border-blue-200 pt-2 mt-2">
                <span>Total de ventas</span>
                <span>{formatCurrency(preview.total)}</span>
              </div>
            </div>
          </div>

          {/* Conteo de efectivo físico */}
          <div>
            <label className="text-sm font-medium text-gray-700">Efectivo contado físicamente ($)</label>
            <input
              type="number"
              min="0"
              step="0.50"
              value={efectivoContado}
              onChange={(e) => setEfectivoContado(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Diferencia */}
          {efectivoContado !== '' && (
            <div className={`rounded-xl p-4 flex justify-between items-center
              ${diferencia >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
            >
              <span className={`text-sm font-medium ${diferencia >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {diferencia >= 0 ? 'Sobrante' : 'Faltante'}
              </span>
              <span className={`text-lg font-bold ${diferencia >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {diferencia >= 0 ? '+' : ''}{formatCurrency(diferencia)}
              </span>
            </div>
          )}

          <Button
            onClick={handleConfirm}
            loading={saving}
            disabled={efectivoContado === ''}
            className="w-full"
            size="lg"
          >
            Confirmar cierre de caja
          </Button>
        </>
      )}
    </div>
  );
};

export default CashCloseForm;
