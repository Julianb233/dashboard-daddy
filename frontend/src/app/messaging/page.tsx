'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { MessagingInterface } from '@/components/messaging/MessagingInterface';

export default function MessagingPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-wizard-emerald-900 dark:text-wizard-dark-text">
              Agent Messaging
            </h1>
            <p className="text-wizard-emerald-600 dark:text-wizard-dark-text-muted mt-1">
              Chat with your AI agents and manage conversations
            </p>
          </div>
        </div>

        {/* Messaging Interface */}
        <div className="bg-surface dark:bg-wizard-dark-bg-secondary rounded-2xl border border-wizard-emerald-100 dark:border-wizard-dark-border h-96">
          <MessagingInterface />
        </div>
      </div>
    </DashboardShell>
  );
}