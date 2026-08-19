import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  ...props
}) => {
  const base = "inline-flex items-center justify-center font-bold transition-all rounded-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-green-600 text-white hover:bg-green-700 shadow-sm border border-transparent",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm border border-transparent",
    warning: "bg-amber-600 text-white hover:bg-amber-700 shadow-sm border border-transparent",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm border border-transparent",
    outline: "bg-transparent text-green-600 border border-green-600 hover:bg-green-50"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin shrink-0" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : Icon ? (
        <Icon className="shrink-0" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
