'use client'

import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen transition-colors
      bg-wizard-dark dark:bg-wizard-dark 
      light:bg-wizard-cream">
      <Sidebar />
      <main className="flex-1 p-8 transition-colors
        bg-gradient-to-br from-wizard-dark via-wizard-emerald/30 to-wizard-dark
        dark:from-wizard-dark dark:via-wizard-emerald/30 dark:to-wizard-dark
        light:from-wizard-cream light:via-wizard-light/10 light:to-wizard-cream">
        {children}
      </main>
    </div>
  );
}
