import apiClient from '../../services/apiClient';

export const getReturns = () =>
  apiClient.get('/returns');

export const getReturnById = (id) =>
  apiClient.get(`/returns/${id}`);

export const createReturn = (data) =>
  apiClient.post('/returns', data);

export const updateReturn = (id, data) =>
  apiClient.put(`/returns/${id}`, data);
