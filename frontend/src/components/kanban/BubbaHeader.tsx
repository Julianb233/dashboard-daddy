'use client';

import { useState, useEffect } from 'react';
import { LogOut, Wifi } from 'lucide-react';

export function BubbaHeader() {
  const [lastSync, setLastSync] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <header className="h-16 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-blue-400">
          Bubba Dashboard • 
          <span className="text-green-400 ml-2">Online</span>
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Wifi size={16} className="text-green-400" />
          <span>Last sync: {formatTime(lastSync)}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition-colors"
          onClick={() => {
            // Add logout functionality here
            console.log('Logout clicked');
          }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}