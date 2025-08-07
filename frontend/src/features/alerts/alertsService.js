import apiClient from '../../services/apiClient';

export const getMaintenanceAlerts = () =>
  apiClient.get('/alerts/maintenance-needed');

export const getMissingSealsAlerts = () =>
  apiClient.get('/alerts/missing-seals');


export const getUnresolvedDiscrepanciesAlerts = () =>
  apiClient.get('/alerts/unresolved-discrepancies');

export const processAlerts = (alerts) =>
  apiClient.post('/alerts/process', alerts);
