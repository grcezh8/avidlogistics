import apiClient from '../../services/apiClient';

export const getFacilities = () =>
  apiClient.get('/facilities');

export const getFacilityById = (id) =>
  apiClient.get(`/facilities/${id}`);

export const createFacility = (data) =>
  apiClient.post('/facilities', data);

export const updateFacility = (id, data) =>
  apiClient.put(`/facilities/${id}`, data);

export const deactivateFacility = (id) =>
  apiClient.delete(`/facilities/${id}`);