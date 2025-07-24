import apiClient from '../../services/apiClient';

export const getKits = () =>
  apiClient.get('/kits');

export const getKitById = (id) =>
  apiClient.get(`/kits/${id}`);

export const createKit = (data) =>
  apiClient.post('/kits', data);

export const updateKit = (id, data) =>
  apiClient.put(`/kits/${id}`, data);
