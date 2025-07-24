import apiClient from '../../services/apiClient';

// Warehouses
export const getWarehouses = () =>
  apiClient.get('/locations/warehouses');

export const getWarehouseById = (id) =>
  apiClient.get(`/locations/warehouses/${id}`);

export const createWarehouse = (data) =>
  apiClient.post('/locations/warehouses', data);

// Poll Sites
export const getPollSites = () =>
  apiClient.get('/locations/pollsites');

export const getPollSiteById = (id) =>
  apiClient.get(`/locations/pollsites/${id}`);

export const createPollSite = (data) =>
  apiClient.post('/locations/pollsites', data);
