import { Search } from 'lucide-react';

const SearchBox = ({
  value,
  onChange,
  placeholder = "Search by ID, Name or Phone Number...",
  className = '',
  ...props
}) => {
  return (
    <div className={`relative max-w-sm flex items-center gap-2 bg-white border border-gray-200 rounded-none px-3 h-10 shadow-sm focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 transition-all ${className}`}>
      <Search size={15} className="text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="search-input border-none outline-none text-sm flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 w-full"
        {...props}
      />
    </div>
  );
};

export default SearchBox;
