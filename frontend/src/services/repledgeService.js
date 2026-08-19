import api from './api';

const API_URL = '/repledges';

export const createRepledge = async (repledgeData) => {
  const response = await api.post(API_URL, repledgeData);
  return response.data; // { repledge, loan }
};

export const getRepledgesByLoan = async (loanId) => {
  const response = await api.get(`${API_URL}/loan/${loanId}`);
  return response.data;
};

export const getAllRepledges = async () => {
  const response = await api.get(API_URL);
  return response.data;
};
