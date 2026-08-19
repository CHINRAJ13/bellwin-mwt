import api from './api';

const API_URL = '/payments';

export const createPayment = async (paymentData) => {
  const response = await api.post(API_URL, paymentData);
  return response.data;
};

export const getPaymentsByLoan = async (loanId) => {
  const response = await api.get(`${API_URL}/loan/${loanId}`);
  return response.data;
};

export const getPaymentHistory = async (loanId) => {
  const response = await api.get(`${API_URL}/history/${loanId}`);
  return response.data; // { loan: {}, payments: [] }
};

export const getAllPayments = async () => {
  const response = await api.get(API_URL);
  return response.data;
};
