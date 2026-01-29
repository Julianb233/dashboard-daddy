'use client';

interface Deliverable {
  id: string;
  title: string;
  date: string;
  icon: string;
}

const deliverables: Deliverable[] = [
  { id: '1', title: 'Daily Briefings', date: 'Jan 28, 2026', icon: '📋' },
  { id: '2', title: 'Email Summaries', date: 'Jan 28, 2026', icon: '📧' },
  { id: '3', title: 'Task Reports', date: 'Jan 28, 2026', icon: '✅' },
  { id: '4', title: 'Calendar Sync', date: 'Jan 28, 2026', icon: '📅' },
];

export function DeliverablesSection() {
  return (
    <div className="mt-6 bg-gray-900 rounded-lg p-4">
      <h3 className="text-yellow-500 font-semibold mb-4 flex items-center gap-2">
        📁 Deliverables
      </h3>
      <div className="grid grid-cols-4 gap-4">
        {deliverables.map((d) => (
          <div key={d.id} className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors">
            <div className="text-2xl mb-2">{d.icon}</div>
            <div className="font-medium text-sm">{d.title}</div>
            <div className="text-xs text-gray-400">{d.date}</div>
            <button className="mt-2 text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">
              Folder
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
