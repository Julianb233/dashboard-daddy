'use client';

import { useState } from 'react';
import { Circle } from 'lucide-react';

export function BubbaSidebar() {
  const [status, setStatus] = useState<'Online' | 'Idle'>('Online');

  return (
    <aside className="w-80 bg-gray-900 border-r border-gray-800 h-screen p-6">
      {/* Agent Avatar and Info */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🫡</div>
        <h2 className="text-xl font-semibold text-blue-400 mb-2">Bubba</h2>
        <p className="text-sm text-gray-400">Personal Assistant Agent</p>
      </div>

      {/* Status Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Status</span>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value as 'Online' | 'Idle')}
            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
          >
            <option value="Online">Online</option>
            <option value="Idle">Idle</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <Circle 
            size={12} 
            className={`fill-current ${status === 'Online' ? 'text-green-400' : 'text-yellow-400'}`} 
          />
          <span className={`text-sm font-medium ${status === 'Online' ? 'text-green-400' : 'text-yellow-400'}`}>
            {status}
          </span>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-green-400 text-sm font-medium">Ready for tasks</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Today's Activity</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tasks Completed</span>
              <span className="text-green-400">8</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>In Progress</span>
              <span className="text-orange-400">3</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pending</span>
              <span className="text-blue-400">5</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Success Rate</span>
              <span className="text-green-400">96%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Avg Response</span>
              <span className="text-blue-400">1.2s</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}