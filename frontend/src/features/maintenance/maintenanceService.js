import apiClient from '../../services/apiClient';

export const getMaintenanceRequests = () =>
  apiClient.get('/maintenance');

export const getMaintenanceRequestById = (id) =>
  apiClient.get(`/maintenance/${id}`);

export const createMaintenanceRequest = (data) =>
  apiClient.post('/maintenance', data);

export const updateMaintenanceRequest = (id, data) =>
  apiClient.put(`/maintenance/${id}`, data);
