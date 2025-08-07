import apiClient from '../../services/apiClient';

export const fetchManifests = (status) =>
  apiClient.get(`/manifests${status ? `?status=${status}` : ''}`);

export const fetchManifestById = (id) =>
  apiClient.get(`/manifests/${id}`);

export const createManifest = (data) =>
  apiClient.post('/manifests', data);

export const addManifestItem = (manifestId, data) =>
  apiClient.post(`/manifests/${manifestId}/items`, data);

export const readyManifest = (manifestId) =>
  apiClient.put(`/manifests/${manifestId}/ready`);

export const packManifestItem = (manifestId, assetId) =>
  apiClient.put(`/manifests/${manifestId}/items/${assetId}/pack`);

export const completeManifest = (manifestId) =>
  apiClient.put(`/manifests/${manifestId}/complete`);

// New enhanced endpoints
export const createManifestWithAssets = (data) =>
  apiClient.post('/manifests/create-with-assets', data);

export const getManifestsWithDetails = (status) =>
  apiClient.get(`/manifests/with-details${status ? `?status=${status}` : ''}`);

export const getManifestWithDetails = (id) =>
  apiClient.get(`/manifests/${id}/details`);

export const finishPacking = (manifestId) =>
  apiClient.post(`/manifests/${manifestId}/finish-packing`);
