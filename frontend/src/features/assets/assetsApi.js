import apiClient from '../../services/apiClient';

export const getAssets = (status = null) => {
  const url = status ? `/assets?status=${status}` : '/assets';
  return apiClient.get(url);
};

export const getAvailableAssets = () => {
  return apiClient.get('/assets?status=Available');
};

export const getAsset = (id) => {
  return apiClient.get(`/assets/${id}`);
};

export const createAsset = (assetData) => {
  return apiClient.post('/assets', assetData);
};

export const updateAsset = (id, assetData) => {
  return apiClient.put(`/assets/${id}`, assetData);
};
