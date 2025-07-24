import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import NotificationsPanel from '../../components/NotificationsPanel';
import PackingJobsList from '../../components/PackingJobsList';
import QuickStatsGrid from '../../components/QuickStatsGrid';

import {
  getProfile
} from '../../features/auth/authService';
import {
  getMaintenanceAlerts
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const userRes = await getProfile();
      setUser(userRes.data);

      const alertsRes = await getMaintenanceAlerts();
      setAlerts(alertsRes.data);

      const manifestsRes = await getManifests('Created');
      setPackingJobs(manifestsRes.data);

      const statsRes = await getInventoryStatusReport();
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={['Dashboard', 'Inventory', 'Packing', 'Returns']} />
      <div className="flex-1 flex flex-col">
        <TopBar title="Warehouse Staff Dashboard" />
        <main className="flex-1 p-4 space-y-4 fade-in">
          <NotificationsPanel alerts={alerts} />
          <QuickStatsGrid stats={stats} />
          <PackingJobsList jobs={packingJobs} />
        </main>
      </div>
    </div>
  );
}
