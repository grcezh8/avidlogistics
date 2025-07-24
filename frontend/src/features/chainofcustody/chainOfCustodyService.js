import apiClient from '../../services/apiClient';

export const getChainOfCustody = (filters = '') =>
  apiClient.get(`/chainofcustody${filters ? `?${filters}` : ''}`);

export const getChainOfCustodyById = (id) =>
  apiClient.get(`/chainofcustody/${id}`);

export const createChainOfCustodyEvent = (data) =>
  apiClient.post('/chainofcustody', data);
