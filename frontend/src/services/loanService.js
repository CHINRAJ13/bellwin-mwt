import api from './api';

const API_URL = '/loans';

export const createLoan = async (loanData) => {
  const response = await api.post(API_URL, loanData);
  return response.data;
};

export const getLoanById = async (loanId) => {
  const response = await api.get(`${API_URL}/${loanId}`);
  return response.data;
};

export const getLoansByCustomer = async (customerId) => {
  const response = await api.get(`${API_URL}/customer/${customerId}`);
  return response.data;
};

export const updateLoan = async (loanId, loanData) => {
  const response = await api.put(`${API_URL}/${loanId}`, loanData);
  return response.data;
};

export const getProvideLoanDetails = async (customerId) => {
  const response = await api.get('/provide-loan/customer/${customerId}');
  return response.data;
};
