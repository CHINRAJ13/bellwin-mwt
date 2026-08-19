import { useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useLoanSearch = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState([]);
    const [searchType, setSearchType] = useState(null);

    const searchLoans = useCallback(async (searchValue) => {
        if (!searchValue || !searchValue.trim()) {
            toast.error('Please enter a Loan ID or Phone Number');
            return null;
        }

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            
            const response = await api.get('/search/loan/${searchValue.trim()}', config);
            const data = response.data;
            
            if (data.success) {
                setResults(data.results);
                setSearchType(data.searchType);
                if (data.count === 0) {
                    toast.error('No matching loans found.');
                }
                return data;
            } else {
                const errMsg = data.message || 'Search failed';
                setError(errMsg);
                toast.error(errMsg);
                return null;
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Error occurred during search';
            setError(errMsg);
            toast.error(errMsg);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearSearch = useCallback(() => {
        setResults([]);
        setError(null);
        setSearchType(null);
    }, []);

    return {
        searchLoans,
        loading,
        error,
        results,
        searchType,
        clearSearch
    };
};
