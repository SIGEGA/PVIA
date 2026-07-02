const variants = {
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  danger:  'bg-red-50 text-red-700 ring-1 ring-red-200',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  info:    'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  gray:    'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
};

const Badge = ({ children, variant = 'gray', className = '' }) => (
  <span className={`
    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
    ${variants[variant] || variants.gray} ${className}
  `}>
    {children}
  </span>
);

export default Badge;
