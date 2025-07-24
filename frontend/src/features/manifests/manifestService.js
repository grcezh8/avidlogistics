import apiClient from '../../services/apiClient';

export const getManifests = (status = '') =>
  apiClient.get(`/manifests${status ? `?status=${status}` : ''}`);

export const getManifestById = (id) =>
  apiClient.get(`/manifests/${id}`);

export const createManifest = (data) =>
  apiClient.post('/manifests', data);
