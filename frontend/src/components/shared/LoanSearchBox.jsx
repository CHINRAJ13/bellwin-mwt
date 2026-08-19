import React, { useState } from 'react';
import { Search, Loader2, X } from 'lucide-react';

const LoanSearchBox = ({ onSearch, loading, placeholder = "Enter Loan ID or Phone Number..." }) => {
    const [searchValue, setSearchValue] = useState('');

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchValue.trim()) {
            onSearch(searchValue.trim());
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    const handleClear = () => {
        setSearchValue('');
    };

    return (
        <div className="flex max-w-xl items-center gap-2 mb-6">
            <div className="relative w-full">
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-none shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm font-medium"
                />
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                {searchValue && (
                    <button 
                        onClick={handleClear}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            <button 
                onClick={handleSearch}
                disabled={loading || !searchValue.trim()}
                className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-none shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
        </div>
    );
};

export default LoanSearchBox;
