import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createProduct, updateProduct } from '../../services/products.service';
import { getCategories } from '../../services/catalog.service';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import useToast from '../../hooks/useToast';

// Esquema de validación para el formulario de productos
const schema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  precio_venta: z.coerce.number().positive('El precio debe ser mayor a 0'),
  precio_compra: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().min(0).optional(),
  stock_minimo: z.coerce.number().min(0).optional(),
  id_categoria: z.string().optional(),
});

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const isEditing = !!product;
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          codigo: product.codigo,
          nombre: product.nombre,
          descripcion: product.descripcion || '',
          precio_venta: product.precio_venta,
          precio_compra: product.costo_unitario,
          stock: product.stock_actual,
          stock_minimo: product.stock_minimo,
          id_categoria: product.categoria_id || '',
        }
      : {},
  });

  // Carga las categorías disponibles al montar
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        await updateProduct(product.id, data);
        toast.success('Producto actualizado correctamente');
      } else {
        await createProduct(data);
        toast.success('Producto creado correctamente');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* El código no se puede editar */}
        <Input
          label="Código"
          placeholder="EJ-001"
          error={errors.codigo?.message}
          disabled={isEditing}
          title={isEditing ? 'El código no puede modificarse' : ''}
          {...register('codigo')}
        />
        <Input
          label="Nombre"
          placeholder="Nombre del producto"
          error={errors.nombre?.message}
          {...register('nombre')}
        />
      </div>

      <Input
        label="Descripción (opcional)"
        placeholder="Descripción breve"
        error={errors.descripcion?.message}
        {...register('descripcion')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Precio venta ($)"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.precio_venta?.message}
          {...register('precio_venta')}
        />
        <Input
          label="Precio compra ($)"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.precio_compra?.message}
          {...register('precio_compra')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Stock inicial"
          type="number"
          step="0.01"
          placeholder="0"
          error={errors.stock?.message}
          {...register('stock')}
        />
        <Input
          label="Stock mínimo"
          type="number"
          step="0.01"
          placeholder="0"
          error={errors.stock_minimo?.message}
          {...register('stock_minimo')}
        />
      </div>

      {/* Selector de categoría */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Categoría</label>
        <select
          {...register('id_categoria')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {isEditing ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
