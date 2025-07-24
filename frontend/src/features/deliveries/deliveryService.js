import apiClient from '../../services/apiClient';

export const getDeliveries = () =>
  apiClient.get('/deliveries');

export const getDeliveryById = (id) =>
  apiClient.get(`/deliveries/${id}`);

export const getDeliveriesByStatus = (status) =>
  apiClient.get(`/deliveries?status=${status}`);

export const getDeliveriesByFacility = (facilityId) =>
  apiClient.get(`/deliveries?facilityId=${facilityId}`);

export const createDelivery = (data) =>
  apiClient.post('/deliveries', data);

export const updateDeliveryStatus = (id, status) =>
  apiClient.put(`/deliveries/${id}/status`, { status });

export const confirmDelivery = (id, data) =>
  apiClient.post(`/deliveries/${id}/confirm`, data);