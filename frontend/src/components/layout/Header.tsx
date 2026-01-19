'use client';

import { Bell, User } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">Agent Control Center</h1>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-800 rounded-lg">
          <Bell size={20} />
        </button>
        <button className="p-2 hover:bg-gray-800 rounded-lg">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
