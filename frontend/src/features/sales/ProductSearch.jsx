import { useState, useRef, useEffect } from 'react';
import { getProducts } from '../../services/products.service';
import { formatCurrency } from '../../utils/formatCurrency';

// Buscador de productos para el POS — busca por nombre o código con debounce
const ProductSearch = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    // Debounce de 300ms antes de buscar
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getProducts({ search: value });
        setResults(data || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (product) => {
    onSelect(product);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Buscar producto por nombre o código..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {loading && (
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-500"
            viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
      </div>

      {/* Dropdown de resultados */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">Sin resultados para "{query}"</p>
          ) : (
            results.map((product) => {
              const agotado = parseFloat(product.stock_actual) <= 0;
              return (
                <button
                  key={product.id}
                  onClick={() => !agotado && handleSelect(product)}
                  disabled={agotado}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex justify-between items-center
                    ${agotado ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.nombre}</p>
                    <p className="text-xs text-gray-500">
                      Código: {product.codigo} · Stock: {product.stock_actual}
                      {agotado && ' · Agotado'}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {formatCurrency(product.precio_venta)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
