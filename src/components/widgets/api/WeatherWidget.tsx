import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge } from 'lucide-react'
import { motion } from 'framer-motion'

interface WeatherData {
  temp: number
  feels_like: number
  humidity: number
  pressure: number
  visibility: number
  wind_speed: number
  description: string
  icon: string
  city: string
}

export const WeatherWidget = React.memo(function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [city, setCity] = useState('San Francisco')

  useEffect(() => {
    fetchWeather()
    const interval = setInterval(fetchWeather, 600000) // Update every 10 minutes
    return () => clearInterval(interval)
  }, [city])

  const fetchWeather = async () => {
    try {
      setLoading(true)
      // Using OpenWeatherMap API - users need to add their API key in settings
      const apiKey = localStorage.getItem('openweather_api_key')
      
      if (!apiKey) {
        // No API key configured - show configuration prompt
        setError('API key required')
        setLoading(false)
        return
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`
      )
      
      if (!response.ok) throw new Error('Failed to fetch weather')
      
      const data = await response.json()
      setWeather({
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: data.visibility,
        wind_speed: Math.round(data.wind.speed),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        city: data.name
      })
      setError(null)
    } catch (err) {
      setError('Unable to fetch weather data')
      console.error('Weather fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="h-12 w-12" />
    
    const iconCode = weather.icon
    if (iconCode.includes('01')) return <Sun className="h-12 w-12 text-yellow-400" />
    if (iconCode.includes('02') || iconCode.includes('03')) return <Cloud className="h-12 w-12 text-gray-400" />
    if (iconCode.includes('09') || iconCode.includes('10')) return <CloudRain className="h-12 w-12 text-blue-400" />
    return <Cloud className="h-12 w-12 text-gray-400" />
  }

  if (loading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-500/5 to-transparent">
        <Cloud className="h-12 w-12 text-blue-400/50 mb-3" />
        <p className="text-sm font-medium text-center mb-1">Weather Widget</p>
        <p className="text-xs text-muted-foreground text-center mb-3">
          {error === 'API key required' ? 'Configure to see live weather' : error}
        </p>
        <p className="text-xs text-blue-500 hover:underline cursor-pointer">
          Settings → Integrations → OpenWeatherMap
        </p>
      </Card>
    )
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Weather</span>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={fetchWeather}
            className="text-xs bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none w-32 text-right"
            placeholder="City"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Weather Display */}
        <div className="flex items-center justify-between">
          <div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-bold"
            >
              {weather?.temp}°F
            </motion.div>
            <p className="text-sm text-muted-foreground capitalize mt-1">
              {weather?.description}
            </p>
            <p className="text-xs text-muted-foreground">
              Feels like {weather?.feels_like}°F
            </p>
          </div>
          <motion.div
            initial={{ rotate: -20, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {getWeatherIcon()}
          </motion.div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="text-sm font-medium">{weather?.humidity}%</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-muted-foreground">Wind</p>
              <p className="text-sm font-medium">{weather?.wind_speed} mph</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground">Pressure</p>
              <p className="text-sm font-medium">{weather?.pressure} hPa</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Visibility</p>
              <p className="text-sm font-medium">{weather ? Math.round(weather.visibility / 1000) : 0} km</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
