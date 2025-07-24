import React, { useState } from 'react';
import { Bell, AlertTriangle, Truck, Wrench, ClipboardList, X } from 'lucide-react';

export default function NotificationsPanel({ alerts = [], onDismiss }) {
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  const getAlertIcon = (type) => {
    const icons = {
      'maintenance': <Wrench className="h-4 w-4" />,
      'delivery': <Truck className="h-4 w-4" />,
      'task': <ClipboardList className="h-4 w-4" />,
      'warning': <AlertTriangle className="h-4 w-4" />
    };
    return icons[type] || <Bell className="h-4 w-4" />;
  };

  const getAlertColor = (severity) => {
    const colors = {
      'critical': 'border-red-200 bg-red-50 text-red-800',
      'high': 'border-orange-200 bg-orange-50 text-orange-800',
      'medium': 'border-yellow-200 bg-yellow-50 text-yellow-800',
      'low': 'border-blue-200 bg-blue-50 text-blue-800',
      'info': 'border-gray-200 bg-gray-50 text-gray-800'
    };
    return colors[severity] || 'border-gray-200 bg-gray-50 text-gray-800';
  };

  const handleDismiss = (alertId) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
    if (onDismiss) {
      onDismiss(alertId);
    }
  };

  // Mock alerts if none provided
  const displayAlerts = alerts.length > 0 ? alerts : [
    {
      id: 1,
      type: 'maintenance',
      severity: 'high',
      title: 'Equipment Maintenance Due',
      message: '15 voting machines require scheduled maintenance before next election',
      facility: 'Main Warehouse',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      type: 'delivery',
      severity: 'medium',
      title: 'Delivery Delay Alert',
      message: 'Delivery to Precinct 23 delayed due to traffic conditions',
      facility: 'Precinct 23',
      timestamp: new Date().toISOString()
    },
    {
      id: 3,
      type: 'task',
      severity: 'low',
      title: 'Manifest Review Required',
      message: '3 manifests pending approval for tomorrow\'s deliveries',
      facility: 'Distribution Center',
      timestamp: new Date().toISOString()
    }
  ];

  const visibleAlerts = displayAlerts.filter(alert => !dismissedAlerts.includes(alert.id));
  const alertCounts = visibleAlerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-white shadow rounded p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Notifications & Alerts
        </h2>
        {Object.keys(alertCounts).length > 0 && (
          <div className="flex items-center space-x-2">
            {alertCounts.critical > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                {alertCounts.critical} Critical
              </span>
            )}
            {alertCounts.high > 0 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                {alertCounts.high} High
              </span>
            )}
            {alertCounts.medium > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                {alertCounts.medium} Medium
              </span>
            )}
          </div>
        )}
      </div>

      {visibleAlerts.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No active notifications</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {visibleAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${getAlertColor(alert.severity)} transition-all`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm mt-1 opacity-90">{alert.message}</p>
                    {alert.facility && (
                      <p className="text-xs mt-2 opacity-75">
                        {alert.facility} • {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="ml-2 p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                  aria-label="Dismiss alert"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
