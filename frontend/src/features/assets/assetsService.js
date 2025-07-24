import apiClient from '../../services/apiClient';

export const getAssets = (status = '') =>
  apiClient.get(`/assets${status ? `?status=${status}` : ''}`);

export const getAssetById = (id) =>
  apiClient.get(`/assets/${id}`);

export const getAssetBySerial = (serial) =>
  apiClient.get(`/assets/serial/${serial}`);

export const createAsset = (data) =>
  apiClient.post('/assets', data);
