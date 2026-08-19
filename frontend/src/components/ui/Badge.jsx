const Badge = ({
  children,
  variant = 'pending',
  className = '',
  ...props
}) => {
  const mapping = {
    success: "bg-green-50 text-green-700 border-green-200",
    active: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-amber-50 text-amber-600 border-amber-200",
    warning: "bg-amber-50 text-amber-600 border-amber-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
    inactive: "bg-red-50 text-red-600 border-red-200",
    danger: "bg-red-50 text-red-600 border-red-200",
    info: "bg-blue-50 text-blue-600 border-blue-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200"
  };

  const style = mapping[variant.toLowerCase()] || mapping.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${style} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
