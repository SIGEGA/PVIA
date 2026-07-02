const DataTable = ({ columns = [], data = [], actions, emptyMessage = 'Sin resultados' }) => (
  <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
    <table className="w-full text-sm text-left">
      <thead>
        <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
          {columns.map((col) => (
            <th key={col.key}
              className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              {col.label}
            </th>
          ))}
          {actions && (
            <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
              Acciones
            </th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50 bg-white">
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length + (actions ? 1 : 0)}
              className="px-5 py-12 text-center text-gray-400">
              <div className="flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <span className="text-sm">{emptyMessage}</span>
              </div>
            </td>
          </tr>
        ) : (
          data.map((row, idx) => (
            <tr key={row.id || idx}
              className="hover:bg-blue-50/40 transition-colors duration-100 group">
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3.5 text-gray-700 whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
              {actions && (
                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    {actions(row)}
                  </div>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default DataTable;
