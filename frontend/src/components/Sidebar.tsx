'use client'

import SidebarNav from './SidebarNav';
import { UserProfile } from './UserProfile';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-wizard-emerald text-white min-h-screen p-4 flex flex-col border-r border-wizard-medium/30">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-wizard-gold">Dashboard Daddy</h1>
        <p className="text-wizard-cream/60 text-sm">Agent Management System</p>
      </div>

      <SidebarNav />

      <div className="mt-auto space-y-4">
        <UserProfile />
        <div className="bg-wizard-dark/50 rounded-lg p-4 border border-wizard-medium/20">
          <p className="text-sm text-wizard-cream/40">Version 0.1.0</p>
        </div>
      </div>
    </aside>
  );
}
