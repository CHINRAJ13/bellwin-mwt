import api from './api';

const API_URL = '/gold-schemes';

export const createGoldScheme = async (schemeData) => {
  const response = await api.post(API_URL, schemeData);
  return response.data;
};

export const getGoldSchemes = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

export const getGoldSchemeByCustomer = async (customerId) => {
  const response = await api.get(`${API_URL}/customer/${customerId}`);
  return response.data;
};
