import React, { useState, useEffect } from 'react'
import { HardDrive } from 'lucide-react'
import { AppWidget } from '../core/AppWidget'

interface DiskInfo {
  name: string
  used: number
  total: number
  percent: number
}

export function DiskSpaceWidget({ id, onRemove }: { id?: string; onRemove?: () => void }) {
  const [disks, setDisks] = useState<DiskInfo[]>([])

  useEffect(() => {
    // In Electron, use system APIs to get disk space
    // For demo, simulating data
    const fetchDiskInfo = async () => {
      if (window.ipcRenderer) {
        try {
          const info = await window.ipcRenderer.invoke('system:disk-space')
          setDisks(info || [])
        } catch {
          // Fallback mock data
          setDisks([
            { name: 'C:', used: 450, total: 1000, percent: 45 },
            { name: 'D:', used: 200, total: 500, percent: 40 }
          ])
        }
      } else {
        // Mock data for web
        setDisks([
          { name: 'C:', used: 450, total: 1000, percent: 45 },
          { name: 'D:', used: 200, total: 500, percent: 40 }
        ])
      }
    }
    
    fetchDiskInfo()
    const interval = setInterval(fetchDiskInfo, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)} TB`
    return `${bytes.toFixed(0)} GB`
  }

  return (
    <AppWidget
      title="Disk Space"
      icon={HardDrive}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={<div>Configure Disk Space</div>}
      id={id || 'disk-space'}
    >
      <div className="space-y-3">
        {disks.map((disk) => (
          <div key={disk.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">{disk.name}</span>
              <span className="text-gray-500">{disk.percent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  disk.percent > 80 ? 'bg-red-500' :
                  disk.percent > 60 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${disk.percent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatBytes(disk.used)} used</span>
              <span>{formatBytes(disk.total)} total</span>
            </div>
          </div>
        ))}
      </div>
    </AppWidget>
  )
}

