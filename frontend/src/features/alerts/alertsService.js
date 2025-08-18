import apiClient from '../../services/apiClient';

// Enhanced alerts API calls
export const getAllAlerts = () =>
  apiClient.get('/alerts');

export const getActiveAlerts = () =>
  apiClient.get('/alerts/active');

export const getAlertsByType = (alertType) =>
  apiClient.get(`/alerts/type/${alertType}`);

export const getAlertsBySeverity = (severity) =>
  apiClient.get(`/alerts/severity/${severity}`);

export const resolveAlert = (alertId, resolvedBy) =>
  apiClient.put(`/alerts/${alertId}/resolve`, { resolvedBy });

export const dismissAlert = (alertId) =>
  apiClient.put(`/alerts/${alertId}/dismiss`);

export const createAlert = (alertData) =>
  apiClient.post('/alerts', alertData);

// Legacy methods for backward compatibility
export const getMaintenanceAlerts = () =>
  apiClient.get('/alerts/maintenance-needed');

export const getMissingSealsAlerts = () =>
  apiClient.get('/alerts/missing-seals');

export const getUnresolvedDiscrepanciesAlerts = () =>
  apiClient.get('/alerts/unresolved-discrepancies');

export const processAlerts = (alerts) =>
  apiClient.post('/alerts/process', alerts);

// Mobile app integration - for creating delay alerts
export const createDeliveryDelayAlert = (manifestId, pollSiteName, delayMinutes) =>
  apiClient.post('/alerts/delivery-delay', {
    manifestId,
    pollSiteName,
    delayMinutes
  });

export const createPickupDelayAlert = (pollSiteId, pollSiteName, delayMinutes) =>
  apiClient.post('/alerts/pickup-delay', {
    pollSiteId,
    pollSiteName,
    delayMinutes
  });

export const createMissingAssetAlert = (assetId, serialNumber, hoursNotScanned) =>
  apiClient.post('/alerts/missing-asset', {
    assetId,
    serialNumber,
    hoursNotScanned
  });

// Utility functions
export const getSeverityColor = (severity) => {
  const colors = {
    'Low': 'bg-blue-100 text-blue-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800'
  };
  return colors[severity] || 'bg-gray-100 text-gray-800';
};

export const getAlertTypeIcon = (alertType) => {
  const icons = {
    'DeliveryDelay': '🚚',
    'PickupDelay': '📦',
    'EquipmentMaintenance': '🔧',
    'MissingAsset': '❓',
    'MissingSeal': '🔒',
    'OverdueReturn': '⏰',
    'InventoryDiscrepancy': '📊',
    'SystemHealth': '⚡'
  };
  return icons[alertType] || '⚠️';
};

export const formatAlertAge = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
};
