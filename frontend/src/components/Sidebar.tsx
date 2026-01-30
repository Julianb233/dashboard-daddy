'use client'

import SidebarNav from './SidebarNav';
import { UserProfile } from './UserProfile';
import { ThemeToggle } from './ThemeToggle';

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen p-4 flex flex-col border-r transition-colors
      bg-wizard-emerald dark:bg-wizard-emerald
      light:bg-wizard-cream light:border-wizard-emerald/20
      border-wizard-medium/30">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wizard-gold dark:text-wizard-gold light:text-wizard-emerald">Dashboard Daddy</h1>
          <p className="text-wizard-cream/60 dark:text-wizard-cream/60 light:text-wizard-emerald/60 text-sm">Agent Management System</p>
        </div>
        <ThemeToggle />
      </div>

      <SidebarNav />

      <div className="mt-auto space-y-4">
        <UserProfile />
        <div className="rounded-lg p-4 border transition-colors
          bg-wizard-dark/50 dark:bg-wizard-dark/50 light:bg-wizard-emerald/10
          border-wizard-medium/20 dark:border-wizard-medium/20 light:border-wizard-emerald/20">
          <p className="text-sm text-wizard-cream/40 dark:text-wizard-cream/40 light:text-wizard-emerald/40">Version 0.1.0</p>
        </div>
      </div>
    </aside>
  );
}
