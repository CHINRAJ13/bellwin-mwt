const Select = ({
  label,
  error,
  id,
  children,
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
      <select
        id={id}
        required={required}
        className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-none text-sm outline-none text-gray-900 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all disabled:opacity-50 disabled:bg-gray-50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%2F%3E%3C%2Fsvg%3E')] bg-[right_1rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat ${
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs font-semibold text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default Select;
