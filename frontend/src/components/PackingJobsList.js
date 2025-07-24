import React from 'react';

export default function PackingJobsList({ jobs = [] }) {
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-lg font-bold mb-2">Packing Jobs</h2>
      {jobs.length === 0 ? (
        <p className="text-gray-500">No packing jobs.</p>
      ) : (
        <ul className="space-y-2">
          {jobs.map((job) => (
            <li key={job.ManifestID} className="border p-2 rounded">
              <div className="flex justify-between">
                <span>{job.ToLocation}</span>
                <span className="text-sm text-gray-500">{job.ElectionName}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
