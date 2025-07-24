import apiClient from '../../services/apiClient';

export const getWarehouseDashboard = () =>
  apiClient.get('/dashboard/warehouse');
