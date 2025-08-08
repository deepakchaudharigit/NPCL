/**
 * Dashboard Statistics Component
 * Displays key power generation metrics and system status cards with visual indicators for NPCL Dashboard.
 */

import { formatPower, formatPercentage } from '@/lib/utils'
import type { DashboardStats as DashboardStatsType } from '@types/index'

interface DashboardStatsProps {
  stats: DashboardStatsType
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Generation',
      value: formatPower(stats.totalPowerGeneration),
      subtitle: `of ${formatPower(stats.totalCapacity)} capacity`,
      color: 'bg-blue-500',
      icon: '⚡',
    },
    {
      title: 'Average Efficiency',
      value: formatPercentage(stats.averageEfficiency),
      subtitle: 'System-wide efficiency',
      color: 'bg-green-500',
      icon: '📊',
    },
    {
      title: 'Units Online',
      value: stats.unitsOnline.toString(),
      subtitle: `${stats.unitsOffline} offline, ${stats.unitsInMaintenance} maintenance`,
      color: 'bg-emerald-500',
      icon: '🟢',
    },
    {
      title: 'System Status',
      value: stats.unitsWithErrors > 0 ? 'Issues' : 'Normal',
      subtitle: stats.unitsWithErrors > 0 ? `${stats.unitsWithErrors} units with errors` : 'All systems operational',
      color: stats.unitsWithErrors > 0 ? 'bg-red-500' : 'bg-green-500',
      icon: stats.unitsWithErrors > 0 ? '⚠️' : '✅',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <div key={index} className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 ${stat.color} rounded-md flex items-center justify-center text-white text-sm`}>
                {stat.icon}
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.title}
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stat.value}
                </dd>
                <dd className="text-sm text-gray-500">
                  {stat.subtitle}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}