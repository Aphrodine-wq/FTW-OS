import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CloudRain, Sun, Wind, Droplets } from 'lucide-react'

export function WeatherCard() {
  return (
    <Card className="h-full bg-gradient-to-br from-blue-400 to-blue-600 text-white overflow-hidden relative border-none shadow-lg">
        {/* Background Decorations */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />

        <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg">San Francisco</h3>
                    <p className="text-blue-100 text-sm">California, US</p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <CloudRain className="h-6 w-6 text-white" />
                </div>
            </div>

            <div className="flex items-end gap-2 mt-4">
                <span className="text-5xl font-bold">64°</span>
                <span className="text-lg text-blue-100 mb-1">Light Rain</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20">
                <div className="text-center">
                    <div className="flex justify-center mb-1"><Wind className="h-3 w-3" /></div>
                    <div className="text-xs font-bold">8 mph</div>
                    <div className="text-[10px] text-blue-100">Wind</div>
                </div>
                <div className="text-center border-l border-white/20">
                    <div className="flex justify-center mb-1"><Droplets className="h-3 w-3" /></div>
                    <div className="text-xs font-bold">82%</div>
                    <div className="text-[10px] text-blue-100">Humidity</div>
                </div>
                <div className="text-center border-l border-white/20">
                    <div className="flex justify-center mb-1"><Sun className="h-3 w-3" /></div>
                    <div className="text-xs font-bold">6:42 AM</div>
                    <div className="text-[10px] text-blue-100">Sunrise</div>
                </div>
            </div>
        </CardContent>
    </Card>
  )
}
