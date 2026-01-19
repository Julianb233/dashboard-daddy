'use client'

import SidebarNav from './SidebarNav';
import { UserProfile } from './UserProfile';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard Daddy</h1>
        <p className="text-gray-400 text-sm">Agent Management System</p>
      </div>

      <SidebarNav />

      <div className="mt-auto space-y-4">
        <UserProfile />
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Version 0.1.0</p>
        </div>
      </div>
    </aside>
  );
}
