import { TaskBoard } from '@/components/tasks';

export const metadata = {
  title: 'Tasks - Dashboard Daddy',
  description: 'Task queue visualization and management',
};

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Task Queue
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Visualize and manage tasks from Vibe Kanban
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700">
                Refresh
              </button>
              <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                New Task
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <TaskBoard />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Connected to Vibe Kanban at localhost:3000
          </p>
        </div>
      </footer>
    </div>
  );
}
