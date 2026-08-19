const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-16 bg-white rounded-none border border-gray-200 shadow-sm p-8 w-full ${className}`}>
      {Icon && <Icon size={48} className="text-gray-300 mx-auto mb-4" />}
      {title && <h3 className="text-lg font-bold text-gray-900 mb-1.5">{title}</h3>}
      {description && <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">{description}</p>}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
