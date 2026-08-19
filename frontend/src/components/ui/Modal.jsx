import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className = '',
  size = 'md'
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-5xl'
  };

  const selectedSize = sizes[size] || sizes.md;

  return (
    <div className="fixed inset-0 bg-gray-900/80 z-[1000] flex items-center justify-center p-4 md:p-6 backdrop-blur-sm animate-fade-in">
      <div className={`bg-white rounded-none w-full ${selectedSize} max-h-[90vh] overflow-hidden shadow-2xl flex flex-col ${className}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white z-10">
          <div>
            <h3 className="font-bold text-gray-900 text-base md:text-lg">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-none border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 z-10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
