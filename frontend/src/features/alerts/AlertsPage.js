import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Truck, Wrench, ClipboardList, Filter, X } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { 
  getMaintenanceAlerts, 
  getMissingSealsAlerts, 
  getUnresolvedDiscrepanciesAlerts 
} from './alertsService';
import { getFacilities } from '../facilities/facilityService';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterFacility, setFilterFacility] = useState('all');
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all alert types
      const [maintenanceRes, sealsRes, discrepanciesRes] = await Promise.all([
        getMaintenanceAlerts(),
        getMissingSealsAlerts(),
        getUnresolvedDiscrepanciesAlerts()
      ]);

      // Combine and format all alerts
      const allAlerts = [
        ...(maintenanceRes.data || []).map(a => ({ 
          ...a, 
          id: `maint-${a.id || Math.random()}`,
          type: 'maintenance', 
          severity: 'high',
          title: 'Equipment Maintenance Required',
          message: a.message || `Asset ${a.assetId} requires maintenance`,
          facility: a.facility || 'Main Warehouse',
          timestamp: a.timestamp || new Date().toISOString()
        })),
        ...(sealsRes.data || []).map(a => ({ 
          ...a, 
          id: `seal-${a.id || Math.random()}`,
          type: 'delivery', 
          severity: 'critical',
          title: 'Missing Seals Alert',
          message: a.message || `Seal missing for manifest ${a.manifestId}`,
          facility: a.facility || 'Distribution Center',
          timestamp: a.timestamp || new Date().toISOString()
        })),
        ...(discrepanciesRes.data || []).map(a => ({ 
          ...a, 
          id: `disc-${a.id || Math.random()}`,
          type: 'warning', 
          severity: 'high',
          title: 'Unresolved Discrepancy',
          message: a.message || `Discrepancy found in audit ${a.auditId}`,
          facility: a.facility || 'Audit Center',
          timestamp: a.timestamp || new Date().toISOString()
        }))
      ];

      // Mock additional alerts for demonstration
      const mockAlerts = [
        {
          id: 'mock-1',
          type: 'maintenance',
          severity: 'high',
          title: 'Urgent Maintenance Required',
          message: '15 voting machines require immediate maintenance before the upcoming election',
          facility: 'Main Warehouse',
          timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
          actionRequired: 'Schedule maintenance'
        },
        {
          id: 'mock-2',
          type: 'delivery',
          severity: 'medium',
          title: 'Delivery Delay',
          message: 'Delivery to Precinct 23 delayed by 2 hours due to traffic conditions',
          facility: 'Precinct 23',
          timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
          actionRequired: 'Update delivery schedule'
        },
        {
          id: 'mock-3',
          type: 'task',
          severity: 'low',
          title: 'Manifest Approval Pending',
          message: '3 manifests require approval for tomorrow\'s deliveries',
          facility: 'Distribution Center',
          timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
          actionRequired: 'Review and approve'
        }
      ];

      setAlerts([...allAlerts, ...mockAlerts]);

      // Mock facilities
      const mockFacilities = [
        { id: 1, name: 'Main Warehouse' },
        { id: 2, name: 'Distribution Center' },
        { id: 3, name: 'Precinct 23' },
        { id: 4, name: 'Audit Center' }
      ];
      setFacilities(mockFacilities);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (dismissedAlerts.includes(alert.id)) return false;
    
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesFacility = filterFacility === 'all' || alert.facility === filterFacility;
    
    return matchesType && matchesSeverity && matchesFacility;
  });

  const getAlertIcon = (type) => {
    const icons = {
      'maintenance': <Wrench className="h-5 w-5" />,
      'delivery': <Truck className="h-5 w-5" />,
      'task': <ClipboardList className="h-5 w-5" />,
      'warning': <AlertTriangle className="h-5 w-5" />
    };
    return icons[type] || <Bell className="h-5 w-5" />;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': 'border-red-300 bg-red-50',
      'high': 'border-orange-300 bg-orange-50',
      'medium': 'border-yellow-300 bg-yellow-50',
      'low': 'border-blue-300 bg-blue-50'
    };
    return colors[severity] || 'border-gray-300 bg-gray-50';
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      'critical': 'bg-red-100 text-red-800',
      'high': 'bg-orange-100 text-orange-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-blue-100 text-blue-800'
    };
    return badges[severity] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleDismiss = (alertId) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
  };

  const alertStats = {
    total: filteredAlerts.length,
    critical: filteredAlerts.filter(a => a.severity === 'critical').length,
    high: filteredAlerts.filter(a => a.severity === 'high').length,
    medium: filteredAlerts.filter(a => a.severity === 'medium').length,
    low: filteredAlerts.filter(a => a.severity === 'low').length
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={['Dashboard', 'Inventory', 'Packing', 'Deliveries', 'Alerts', 'Custody']} />
      <div className="flex-1 flex flex-col">
        <TopBar title="Alerts & Notifications" />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Alert Center</h1>
            <p className="text-gray-600">Monitor and manage all system alerts and notifications</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{alertStats.total}</p>
                </div>
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{alertStats.critical}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">High Priority</p>
                  <p className="text-2xl font-bold text-orange-600">{alertStats.high}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-400" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Medium</p>
                  <p className="text-2xl font-bold text-yellow-600">{alertStats.medium}</p>
                </div>
                <Bell className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Low</p>
                  <p className="text-2xl font-bold text-blue-600">{alertStats.low}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="delivery">Delivery</option>
                  <option value="task">Tasks</option>
                  <option value="warning">Warnings</option>
                </select>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={filterFacility}
                  onChange={(e) => setFilterFacility(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Facilities</option>
                  {facilities.map(facility => (
                    <option key={facility.id} value={facility.name}>{facility.name}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => {
                  setFilterType('all');
                  setFilterSeverity('all');
                  setFilterFacility('all');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Bell className="h-8 w-8 text-gray-400 animate-pulse" />
                </div>
                <p className="text-gray-500">Loading alerts...</p>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No alerts matching your filters</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{alert.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadge(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{alert.facility}</span>
                          <span>•</span>
                          <span>{formatTime(alert.timestamp)}</span>
                          {alert.actionRequired && (
                            <>
                              <span>•</span>
                              <button className="text-blue-600 hover:text-blue-800 font-medium">
                                {alert.actionRequired} →
                              </button>
                            </>
                          )}
                        </div>
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
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
