import apiClient from '../../services/apiClient';

export const getSeals = (status = '') =>
  apiClient.get(`/seals${status ? `?status=${status}` : ''}`);

export const getSealById = (id) =>
  apiClient.get(`/seals/${id}`);

export const createSeal = (data) =>
  apiClient.post('/seals', data);
