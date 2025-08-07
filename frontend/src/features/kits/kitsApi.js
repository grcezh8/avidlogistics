import apiClient from '../../services/apiClient';

export const getPackedKits = () =>
  apiClient.get('/kits/packed');

export const getKitDetails = (kitId) =>
  apiClient.get(`/kits/${kitId}/details`);

export const getKits = (status) =>
  apiClient.get(`/kits${status ? `?status=${status}` : ''}`);
