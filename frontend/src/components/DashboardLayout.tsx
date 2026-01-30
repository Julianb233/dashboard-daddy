'use client'

import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-wizard-dark">
      <Sidebar />
      <main className="flex-1 p-8 bg-gradient-to-br from-wizard-dark via-wizard-emerald/30 to-wizard-dark">
        {children}
      </main>
    </div>
  );
}
