import React from 'react';

export default function NotificationsPanel({ notifications = [] }) {
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-lg font-bold mb-2">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications.</p>
      ) : (
        <ul className="list-disc ml-5 space-y-1">
          {notifications.map((note, idx) => (
            <li key={idx}>{note.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
