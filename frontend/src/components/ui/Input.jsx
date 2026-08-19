const Input = ({
  label,
  error,
  id,
  type = 'text',
  className = '',
  containerClassName = '',
  required = false,
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        required={required}
        className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-none text-sm outline-none text-gray-900 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all placeholder:text-gray-400 disabled:opacity-50 disabled:bg-gray-50 ${
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-semibold text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default Input;
