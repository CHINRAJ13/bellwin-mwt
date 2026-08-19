const PageHeader = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  className = ''
}) => {
  return (
    <div className={`print:hidden flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 ${className}`}>
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 m-0">{title}</h1>
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 m-0">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
