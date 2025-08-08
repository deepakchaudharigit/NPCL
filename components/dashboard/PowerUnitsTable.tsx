import { formatPower, formatDateTime, getStatusColor } from '@/lib/utils'
import type { PowerUnitWithReadings } from '@types/index'

interface PowerUnitsTableProps {
  data: PowerUnitWithReadings[]
  onRefresh: () => void
}

export function PowerUnitsTable({ data, onRefresh }: PowerUnitsTableProps) {
  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Power Units</h3>
          <button
            onClick={onRefresh}
            className="btn-outline text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Generation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Efficiency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((unit) => {
              const latestReading = unit.latestReading
              
              return (
                <tr key={unit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                      <div className="text-sm text-gray-500">{unit.location}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {unit.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(unit.status)}`}>
                      {unit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {latestReading ? formatPower(latestReading.generation) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPower(unit.capacity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {latestReading ? `${latestReading.efficiency.toFixed(1)}%` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {latestReading ? formatDateTime(latestReading.timestamp) : 'No data'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No power units found
        </div>
      )}
    </div>
  )
}