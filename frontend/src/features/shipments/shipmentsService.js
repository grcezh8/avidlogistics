import apiClient from '../../services/apiClient';

export const getShipments = () =>
  apiClient.get('/shipments');

export const getShipmentById = (id) =>
  apiClient.get(`/shipments/${id}`);

export const createShipment = (data) =>
  apiClient.post('/shipments', data);

export const updateShipment = (id, data) =>
  apiClient.put(`/shipments/${id}`, data);
