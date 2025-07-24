import React from 'react';
import { Bell } from 'lucide-react';

export default function NotificationsPanel({ alerts = [] }) {
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-lg font-bold mb-2 flex items-center">
        <Bell className="h-5 w-5 mr-2" /> Notifications
      </h2>
      {alerts.length === 0 ? (
        <p className="text-gray-500">No notifications.</p>
      ) : (
        <ul className="list-disc ml-5 space-y-1">
          {alerts.map((alert, idx) => (
            <li key={idx}>{alert.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
