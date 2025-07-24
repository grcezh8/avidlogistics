import React from 'react';

export default function QuickStatsGrid({ stats }) {
  const getIcon = (label) => {
    const icons = {
      'Total Assets': (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      'In Storage': (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H15a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      'Assigned': (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'Out for Delivery': (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    };
    return icons[label] || (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    );
  };

  const getColorClasses = (label) => {
    const colors = {
      'Total Assets': {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        number: 'text-blue-600'
      },
      'In Storage': {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        number: 'text-green-600'
      },
      'Assigned': {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        number: 'text-purple-600'
      },
      'Out for Delivery': {
        bg: 'bg-orange-50',
        icon: 'text-orange-600',
        number: 'text-orange-600'
      }
    };
    return colors[label] || {
      bg: 'bg-gray-50',
      icon: 'text-gray-600',
      number: 'text-gray-600'
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 fade-in">
      <StatCard 
        label="Total Assets" 
        value={stats.totalAssets} 
        icon={getIcon('Total Assets')}
        colors={getColorClasses('Total Assets')}
      />
      <StatCard 
        label="In Storage" 
        value={stats.inStorage} 
        icon={getIcon('In Storage')}
        colors={getColorClasses('In Storage')}
      />
      <StatCard 
        label="Assigned" 
        value={stats.assigned} 
        icon={getIcon('Assigned')}
        colors={getColorClasses('Assigned')}
      />
      <StatCard 
        label="Out for Delivery" 
        value={stats.outForDelivery} 
        icon={getIcon('Out for Delivery')}
        colors={getColorClasses('Out for Delivery')}
      />
    </div>
  );
}

const StatCard = ({ label, value, icon, colors }) => (
  <div className="clean-stat-card">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded ${colors.bg}`}>
        <div className={colors.icon}>
          {icon}
        </div>
      </div>
      <div className="text-right">
        <div className={`clean-stat-number ${colors.number}`}>
          {value || 0}
        </div>
      </div>
    </div>
    <div className="clean-stat-label">
      {label}
    </div>
    <div className="mt-2 flex items-center text-xs text-gray-500">
      <svg className="w-3 h-3 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
      <span>+2.5% from last week</span>
    </div>
  </div>
);
