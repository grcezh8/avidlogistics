import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import NotificationsPanel from '../../components/NotificationsPanel';
import PackingJobsList from '../../components/PackingJobsList';
import QuickStatsGrid from '../../components/QuickStatsGrid';
import ElectionPanel from '../../components/ElectionPanel';
import TasksPanel from '../../components/TasksPanel';

import {
  getProfile
} from '../../features/auth/authService';
import {
  getMaintenanceAlerts,
  getMissingSealsAlerts,
  getOverdueReturnsAlerts
} from '../../features/alerts/alertsService';
import {
  getManifests
} from '../../features/manifests/manifestService';
import {
  getInventoryStatusReport
} from '../../features/reports/reportService';

export default function WarehouseDashboardPage() {
  const [user, setUser] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [packingJobs, setPackingJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedElection, setSelectedElection] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      loadElectionSpecificData(selectedElection.id);
    }
  }, [selectedElection]);

  const loadDashboardData = async () => {
    try {
      const userRes = await getProfile();
      setUser(userRes.data);

      // Load all types of alerts
      const [maintenanceRes, sealsRes, returnsRes] = await Promise.all([
        getMaintenanceAlerts(),
        getMissingSealsAlerts(),
        getOverdueReturnsAlerts()
      ]);

      // Combine and format alerts
      const allAlerts = [
        ...(maintenanceRes.data || []).map(a => ({ ...a, type: 'maintenance', severity: 'high' })),
        ...(sealsRes.data || []).map(a => ({ ...a, type: 'delivery', severity: 'medium' })),
        ...(returnsRes.data || []).map(a => ({ ...a, type: 'task', severity: 'low' }))
      ];
      setAlerts(allAlerts);

      const manifestsRes = await getManifests('Created');
      setPackingJobs(manifestsRes.data);

      const statsRes = await getInventoryStatusReport();
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadElectionSpecificData = async (electionId) => {
    try {
      // Load election-specific manifests and tasks
      const manifestsRes = await getManifests(`?electionId=${electionId}`);
      
      // Transform manifests into tasks
      const manifestTasks = (manifestsRes.data || []).map(manifest => ({
        id: manifest.id,
        type: 'manifest',
        title: `Manifest #${manifest.manifestNumber || manifest.id}`,
        description: `${manifest.status} - ${manifest.itemCount || 0} items`,
        priority: manifest.status === 'Created' ? 'high' : 'normal',
        timestamp: manifest.updatedAt || manifest.createdAt,
        facility: manifest.fromFacility?.name || 'Unknown',
        action: manifest.status === 'Created' ? 'Review' : 'View'
      }));

      setTasks(manifestTasks);
    } catch (err) {
      console.error('Error loading election data:', err);
    }
  };

  const handleElectionChange = (election) => {
    setSelectedElection(election);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={['Dashboard', 'Inventory', 'Packing', 'Returns', 'Manifests', 'Deliveries', 'Alerts']} />
      <div className="flex-1 flex flex-col">
        <TopBar title="Warehouse Dashboard" />
        <main className="flex-1 p-4 fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Election Panel - spans 1 column */}
            <div className="lg:col-span-1">
              <ElectionPanel onElectionChange={handleElectionChange} />
            </div>
            
            {/* Notifications Panel - spans 2 columns */}
            <div className="lg:col-span-2">
              <NotificationsPanel alerts={alerts} />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-4">
            <QuickStatsGrid stats={stats} />
          </div>

          {/* Tasks and Packing Jobs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TasksPanel tasks={tasks} />
            <PackingJobsList jobs={packingJobs} />
          </div>
        </main>
      </div>
    </div>
  );
}
