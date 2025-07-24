import React from 'react';

export default function Sidebar({ links = [] }) {
  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Menu</h2>
      <ul>
        {links.map((link, idx) => (
          <li key={idx} className="mb-2">
            <button className="w-full text-left hover:bg-gray-700 p-2 rounded">
              {link}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
