import api from './api';

const API_URL = '/customer-ledger';

export const getCustomerLedger = async (customerId) => {
    try {
        const response = await api.get(`${API_URL}/${customerId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Server error occurred while fetching ledger.' };
    }
};
