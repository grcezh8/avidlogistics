import React from 'react';

export default function TasksList({ tasks = [] }) {
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-lg font-bold mb-2">Tasks Due Today</h2>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks scheduled.</p>
      ) : (
        <ul className="list-disc ml-5 space-y-1">
          {tasks.map((task, idx) => (
            <li key={idx}>
              <span className="font-semibold">{task.time}</span> - {task.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
