import { formatPower } from '@/lib/utils'
import type { PowerUnitWithReadings } from '@types/index'

interface PowerGenerationChartProps {
  data: PowerUnitWithReadings[]
}

export function PowerGenerationChart({ data }: PowerGenerationChartProps) {
  const chartData = data.map(unit => ({
    name: unit.name,
    generation: unit.readings[0]?.generation || 0,
    capacity: unit.capacity,
    efficiency: unit.readings[0]?.efficiency || 0,
  }))

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Power Generation Overview</h3>
      
      <div className="space-y-4">
        {chartData.map((unit, index) => {
          const utilizationPercent = (unit.generation / unit.capacity) * 100
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{unit.name}</span>
                <span className="text-sm text-gray-500">
                  {formatPower(unit.generation)} / {formatPower(unit.capacity)}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Utilization: {utilizationPercent.toFixed(1)}%</span>
                <span>Efficiency: {unit.efficiency.toFixed(1)}%</span>
              </div>
            </div>
          )
        })}
      </div>
      
      {chartData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No power generation data available
        </div>
      )}
    </div>
  )
}