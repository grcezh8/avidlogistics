import React from 'react';
import { ClipboardList, Package, Truck, AlertCircle } from 'lucide-react';

export default function TasksPanel({ tasks = [] }) {
  const getTaskIcon = (type) => {
    const icons = {
      'manifest': <ClipboardList className="h-4 w-4" />,
      'maintenance': <Package className="h-4 w-4" />,
      'delivery': <Truck className="h-4 w-4" />,
      'alert': <AlertCircle className="h-4 w-4" />
    };
    return icons[type] || <ClipboardList className="h-4 w-4" />;
  };

  const getTaskColor = (priority) => {
    const colors = {
      'high': 'border-red-200 bg-red-50',
      'medium': 'border-yellow-200 bg-yellow-50',
      'low': 'border-green-200 bg-green-50',
      'normal': 'border-gray-200 bg-white'
    };
    return colors[priority] || 'border-gray-200 bg-white';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800',
      'normal': 'bg-gray-100 text-gray-800'
    };
    return badges[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Mock tasks data if none provided
  const displayTasks = tasks.length > 0 ? tasks : [
    {
      id: 1,
      type: 'manifest',
      title: 'Manifest #M-2024-001 Updated',
      description: 'Added 5 new voting machines to delivery manifest for District 7',
      priority: 'high',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      facility: 'Main Warehouse',
      action: 'Review and approve'
    },
    {
      id: 2,
      type: 'maintenance',
      title: 'Maintenance Equipment Ready',
      description: '12 ballot scanners completed maintenance and ready for shipping',
      priority: 'medium',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      facility: 'Maintenance Center',
      action: 'Schedule pickup'
    },
    {
      id: 3,
      type: 'delivery',
      title: 'Delivery Confirmation Pending',
      description: 'Awaiting confirmation for delivery to Precinct 15',
      priority: 'normal',
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
      facility: 'Precinct 15',
      action: 'Confirm delivery'
    },
    {
      id: 4,
      type: 'alert',
      title: 'Low Inventory Alert',
      description: 'Privacy screens inventory below minimum threshold',
      priority: 'medium',
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      facility: 'Main Warehouse',
      action: 'Order supplies'
    }
  ];

  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-lg font-bold mb-4 flex items-center">
        <ClipboardList className="h-5 w-5 mr-2" />
        Tasks & Updates
      </h2>

      {displayTasks.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No pending tasks</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task }) {
  const getTaskIcon = (type) => {
    const icons = {
      'manifest': <ClipboardList className="h-4 w-4" />,
      'maintenance': <Package className="h-4 w-4" />,
      'delivery': <Truck className="h-4 w-4" />,
      'alert': <AlertCircle className="h-4 w-4" />
    };
    return icons[type] || <ClipboardList className="h-4 w-4" />;
  };

  const getTaskColor = (priority) => {
    const colors = {
      'high': 'border-red-200 bg-red-50',
      'medium': 'border-yellow-200 bg-yellow-50',
      'low': 'border-green-200 bg-green-50',
      'normal': 'border-gray-200 bg-white'
    };
    return colors[priority] || 'border-gray-200 bg-white';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800',
      'normal': 'bg-gray-100 text-gray-800'
    };
    return badges[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getTaskColor(task.priority)} transition-all hover:shadow-md cursor-pointer`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start space-x-3">
          <div className="mt-1">
            {getTaskIcon(task.type)}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{task.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>{task.facility}</span>
          <span>•</span>
          <span>{formatTime(task.timestamp)}</span>
        </div>
        {task.action && (
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            {task.action} →
          </button>
        )}
      </div>
    </div>
  );
}