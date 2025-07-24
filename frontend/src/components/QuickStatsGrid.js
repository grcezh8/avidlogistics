import React from 'react';

export default function QuickStatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Total Assets" value={stats.totalAssets} color="blue" />
      <StatCard label="In Storage" value={stats.inStorage} color="green" />
      <StatCard label="Assigned" value={stats.assigned} color="indigo" />
      <StatCard label="Out for Delivery" value={stats.outForDelivery} color="orange" />
    </div>
  );
}

const StatCard = ({ label, value, color }) => (
  <div className={`text-center bg-white shadow rounded p-4`}>
    <div className={`text-2xl font-bold text-${color}-600`}>{value || 0}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);
