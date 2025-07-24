import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function TopBar({ title }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="flex items-center space-x-4">
        <span className="text-gray-700">{user?.name}</span>
        <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">
          Logout
        </button>
      </div>
    </header>
  );
}
