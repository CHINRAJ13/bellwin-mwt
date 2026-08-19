import api from './api';

const API_URL = '/loan-closure';

export const getClosureDetails = async (loanId) => {
    try {
        const response = await api.get(`${API_URL}/${loanId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Server error' };
    }
};

export const processClosure = async (loanId, closureData) => {
    try {
        const response = await api.post(`${API_URL}/${loanId}`, closureData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Server error' };
    }
};
