import apiClient from '../../services/apiClient';

export const getAssets = (status = '') =>
  apiClient.get(`/assets${status ? `?status=${status}` : ''}`);

export const getAssetById = (id) =>
  apiClient.get(`/assets/${id}`);

export const getAssetBySerial = (serial) =>
  apiClient.get(`/assets/serial/${serial}`);

export const createAsset = (data) =>
  apiClient.post('/assets', data);

export const getAssetsByFacility = (facilityId, status) => {
  const query = new URLSearchParams();
  if (facilityId) query.append('facilityId', facilityId);
  if (status) query.append('status', status);
  return apiClient.get(`/assets?${query.toString()}`);
};

export const updateAssetStatus = (assetId, status) =>
  apiClient.put(`/assets/${assetId}/status`, { status });

export const getAvailableAssets = () =>
  apiClient.get('/assets?status=Available');

export const getInventoryDashboard = () =>
  apiClient.get('/assets');
