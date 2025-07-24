import React from 'react';

export default function UserProfileButton({ user }) {
  return (
    <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
      {user?.name || 'Profile'}
    </button>
  );
}
