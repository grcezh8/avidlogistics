import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import ElectionPanel from '../../components/ElectionPanel';
import EnhancedNotificationsPanel from '../../components/EnhancedNotificationsPanel';

import {
  getProfile
} from '../../features/auth/authService';
import {
  getActiveAlerts
} from '../../features/alerts/alertsService';

export default function WarehouseDashboardPage() {
  const [user, setUser] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Set up auto-refresh for alerts every 30 seconds
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const userRes = await getProfile();
      setUser(userRes.data);
      await loadAlerts();
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const alertsRes = await getActiveAlerts();
      setAlerts(alertsRes.data || []);
    } catch (err) {
      console.error('Error loading alerts:', err);
    }
  };

  const handleElectionChange = (election) => {
    setSelectedElection(election);
  };

  const handleAlertAction = async (alertId, action) => {
    // Refresh alerts after any action
    await loadAlerts();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={['Dashboard', 'Inventory', 'Packing', 'Custody']} />
      <div className="flex-1 flex flex-col">
        <TopBar title="Warehouse Dashboard" />
        <main className="flex-1 p-4 fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            {/* Election Panel - Fixed Left Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <ElectionPanel onElectionChange={handleElectionChange} />
                
                {/* Election Summary Stats */}
                {selectedElection && (
                  <div className="mt-6 bg-white shadow rounded p-4">
                    <h3 className="text-lg font-semibold mb-3">Election Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Alerts</span>
                        <span className="font-medium text-red-600">
                          {alerts.filter(a => a.severity === 'Critical' || a.severity === 'High').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Alerts</span>
                        <span className="font-medium">{alerts.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Poll Sites</span>
                        <span className="font-medium">{selectedElection.totalFacilities || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Manifests</span>
                        <span className="font-medium">{selectedElection.activeManifests || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Notifications and Alerts Panel - Right Side */}
            <div className="lg:col-span-3">
              <EnhancedNotificationsPanel 
                alerts={alerts} 
                loading={loading}
                onAlertAction={handleAlertAction}
                onRefresh={loadAlerts}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
