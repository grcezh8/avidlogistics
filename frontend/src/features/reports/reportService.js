import apiClient from '../../services/apiClient';

export const getInventoryStatusReport = () =>
  apiClient.get('/reports/inventory-status');

export const getSealUsageReport = () =>
  apiClient.get('/reports/seal-usage');

export const getCustodyLogReport = () =>
  apiClient.get('/reports/custody-log');

export const getAssetStatusReport = () =>
  apiClient.get('/reports/asset-status');

export const getManifestStatusReport = () =>
  apiClient.get('/reports/manifest-status');
