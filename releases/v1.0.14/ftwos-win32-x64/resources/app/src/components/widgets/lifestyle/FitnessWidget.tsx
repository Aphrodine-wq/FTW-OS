import React, { useState, useEffect } from 'react'
import { Activity, Target } from 'lucide-react'
import { AppWidget } from '../core/AppWidget'

export function FitnessWidget({ id, onRemove }: { id?: string; onRemove?: () => void }) {
  const [steps, setSteps] = useState(8420)
  const [calories, setCalories] = useState(320)
  const [goal, setGoal] = useState(10000)

  useEffect(() => {
    // Integrate with fitness APIs (Fitbit, Apple Health, etc.)
    // For demo, simulating incremental updates
    const interval = setInterval(() => {
      setSteps(prev => Math.min(prev + Math.floor(Math.random() * 5), goal))
      setCalories(prev => prev + Math.floor(Math.random() * 2))
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [goal])

  const progress = (steps / goal) * 100

  return (
    <AppWidget
      title="Fitness Tracker"
      icon={Activity}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={<div>Configure Fitness</div>}
      id={id || 'fitness'}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Steps</span>
            <span className="text-sm text-gray-500">{steps.toLocaleString()} / {goal.toLocaleString()}</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium">Calories</span>
          </div>
          <p className="text-lg font-bold">{calories}</p>
        </div>
      </div>
    </AppWidget>
  )
}

