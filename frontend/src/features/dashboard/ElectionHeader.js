import React from 'react';

export default function ElectionHeader({ electionName }) {
  return (
    <div className="text-xl font-semibold">
      Election: {electionName || "No Election Selected"}
    </div>
  );
}
