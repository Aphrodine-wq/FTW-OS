import React, { useState, useEffect } from 'react'
import { Wifi, Download, Upload } from 'lucide-react'
import { AppWidget } from '../core/AppWidget'

export const NetworkSpeedWidget = React.memo(function NetworkSpeedWidget({ id, onRemove }: { id?: string; onRemove?: () => void }) {
  const [downloadSpeed, setDownloadSpeed] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState(0)

  useEffect(() => {
    // Simulate network speed monitoring
    // In production, use Electron's network APIs or a speed test service
    const interval = setInterval(() => {
      setDownloadSpeed(Math.random() * 100 + 50) // 50-150 Mbps
      setUploadSpeed(Math.random() * 50 + 20) // 20-70 Mbps
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <AppWidget
      title="Network Speed"
      icon={Wifi}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={<div>Configure Network Speed</div>}
      id={id || 'network-speed'}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Download</span>
          </div>
          <p className="text-lg font-bold">{downloadSpeed.toFixed(1)} Mbps</p>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Upload</span>
          </div>
          <p className="text-lg font-bold">{uploadSpeed.toFixed(1)} Mbps</p>
        </div>
      </div>
    </AppWidget>
  )
})

