import { formatDateTime } from '@/lib/utils'

export function RecentActivity() {
  // Mock data for recent activity
  const activities = [
    {
      id: 1,
      type: 'maintenance',
      message: 'Scheduled maintenance completed for Unit A1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: '🔧',
      color: 'text-blue-600',
    },
    {
      id: 2,
      type: 'alert',
      message: 'Efficiency drop detected in Unit B2',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      icon: '⚠️',
      color: 'text-yellow-600',
    },
    {
      id: 3,
      type: 'system',
      message: 'Unit C1 brought online successfully',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      icon: '✅',
      color: 'text-green-600',
    },
    {
      id: 4,
      type: 'user',
      message: 'New operator account created',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      icon: '👤',
      color: 'text-purple-600',
    },
    {
      id: 5,
      type: 'report',
      message: 'Daily generation report generated',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      icon: '📊',
      color: 'text-indigo-600',
    },
  ]

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, index) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {index !== activities.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                      {activity.icon}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-900">{activity.message}</p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      {formatDateTime(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-6">
        <button className="text-sm text-indigo-600 hover:text-indigo-500">
          View all activity →
        </button>
      </div>
    </div>
  )
}