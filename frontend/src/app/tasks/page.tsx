import DashboardLayout from '@/components/DashboardLayout';

export default function TasksPage() {
  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            + New Task
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-4">
              <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                All
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                Pending
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                Running
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                Completed
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                Failed
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg">No tasks found</p>
              <p className="text-sm mt-2">Create a task to assign work to your agents</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
