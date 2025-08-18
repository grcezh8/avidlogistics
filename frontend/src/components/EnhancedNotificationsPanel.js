import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, X, RefreshCw, Filter, Clock, AlertCircle } from 'lucide-react';
import { 
  resolveAlert, 
  dismissAlert, 
  getSeverityColor, 
  getAlertTypeIcon, 
  formatAlertAge 
} from '../features/alerts/alertsService';

export default function EnhancedNotificationsPanel({ alerts = [], loading = false, onAlertAction, onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [actionLoading, setActionLoading] = useState({});

  const filterOptions = [
    { value: 'all', label: 'All Alerts', count: alerts.length },
    { value: 'Critical', label: 'Critical', count: alerts.filter(a => a.severity === 'Critical').length },
    { value: 'High', label: 'High', count: alerts.filter(a => a.severity === 'High').length },
    { value: 'Medium', label: 'Medium', count: alerts.filter(a => a.severity === 'Medium').length },
    { value: 'Low', label: 'Low', count: alerts.filter(a => a.severity === 'Low').length }
  ];

  const sortOptions = [
    { value: 'priority', label: 'Priority' },
    { value: 'created', label: 'Created Date' },
    { value: 'type', label: 'Alert Type' }
  ];

  const filteredAndSortedAlerts = alerts
    .filter(alert => filter === 'all' || alert.severity === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return b.priority - a.priority;
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'type':
          return a.alertType.localeCompare(b.alertType);
        default:
          return 0;
      }
    });

  const handleResolveAlert = async (alertId) => {
    try {
      setActionLoading(prev => ({ ...prev, [alertId]: 'resolving' }));
      await resolveAlert(alertId, 'Warehouse Staff');
      if (onAlertAction) {
        await onAlertAction(alertId, 'resolve');
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [alertId]: null }));
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      setActionLoading(prev => ({ ...prev, [alertId]: 'dismissing' }));
      await dismissAlert(alertId);
      if (onAlertAction) {
        await onAlertAction(alertId, 'dismiss');
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [alertId]: null }));
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'High':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'Medium':
        return <Bell className="h-5 w-5 text-yellow-500" />;
      case 'Low':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bell className="h-6 w-6 mr-2 text-gray-600" />
            <h2 className="text-xl font-bold">Notifications & Alerts</h2>
            {alerts.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {alerts.length}
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Refresh alerts"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading alerts...</span>
          </div>
        ) : filteredAndSortedAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <CheckCircle className="h-12 w-12 mb-2 text-green-400" />
            <p className="text-lg font-medium">No active alerts</p>
            <p className="text-sm">All systems are running smoothly</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedAlerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{getAlertTypeIcon(alert.alertType)}</span>
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {alert.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatAlertAge(alert.createdAt)}</span>
                        <span>•</span>
                        <span>{alert.alertType.replace(/([A-Z])/g, ' $1').trim()}</span>
                        {alert.relatedEntityType && alert.relatedEntityId && (
                          <>
                            <span>•</span>
                            <span>{alert.relatedEntityType} #{alert.relatedEntityId}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      disabled={actionLoading[alert.id]}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      title="Mark as resolved"
                    >
                      {actionLoading[alert.id] === 'resolving' ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      <span className="ml-1">Resolve</span>
                    </button>
                    <button
                      onClick={() => handleDismissAlert(alert.id)}
                      disabled={actionLoading[alert.id]}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                      title="Dismiss alert"
                    >
                      {actionLoading[alert.id] === 'dismissing' ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      <span className="ml-1">Dismiss</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with summary */}
      {filteredAndSortedAlerts.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {filteredAndSortedAlerts.length} of {alerts.length} alerts
            </span>
            <div className="flex space-x-4">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                Critical: {alerts.filter(a => a.severity === 'Critical').length}
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
                High: {alerts.filter(a => a.severity === 'High').length}
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                Medium: {alerts.filter(a => a.severity === 'Medium').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
