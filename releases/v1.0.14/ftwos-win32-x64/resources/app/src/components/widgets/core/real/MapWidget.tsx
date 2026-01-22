import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Loader, AlertCircle, Navigation } from 'lucide-react'
import { cn } from '@/services/utils'

interface Location {
  lat: number
  lng: number
  name?: string
}

interface MapWidgetProps {
  apiKey?: string
  centerLat?: number
  centerLng?: number
  zoom?: number
  height?: string
}

export const MapWidget: React.FC<MapWidgetProps> = ({
  apiKey = '',
  centerLat = 40.7128,
  centerLng = -74.0060,
  zoom = 12,
  height = '100%'
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    loadMapLibrary()
  }, [])

  useEffect(() => {
    if (isLoading === false && containerRef.current) {
      initializeMap()
    }
  }, [isLoading])

  const loadMapLibrary = async () => {
    try {
      // Dynamically load Leaflet
      if (!window.L) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
        document.head.appendChild(link)

        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
        script.onload = () => setIsLoading(false)
        script.onerror = () => {
          setError('Failed to load map library')
          setIsLoading(false)
        }
        document.body.appendChild(script)
      } else {
        setIsLoading(false)
      }

      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              name: 'Your Location'
            })
          },
          () => {
            // Fallback to default
            setCurrentLocation({
              lat: centerLat,
              lng: centerLng,
              name: 'Default Location'
            })
          }
        )
      }
    } catch (err) {
      setError('Could not load map')
      setIsLoading(false)
    }
  }

  const initializeMap = () => {
    if (!containerRef.current || !window.L) return

    try {
      const L = window.L
      const location = currentLocation || { lat: centerLat, lng: centerLng }

      if (mapRef.current) {
        mapRef.current.remove()
      }

      mapRef.current = L.map(containerRef.current).setView(
        [location.lat, location.lng],
        zoom
      )

      // OpenStreetMap tiles (free, no API key needed)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)

      // Add marker for current location
      L.marker([location.lat, location.lng])
        .bindPopup(`<strong>${location.name}</strong>`)
        .addTo(mapRef.current)
        .openPopup()

      setIsLoading(false)
    } catch (err) {
      setError('Failed to initialize map')
      setIsLoading(false)
    }
  }

  const zoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn()
  }

  const zoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut()
  }

  const locateMe = () => {
    if (navigator.geolocation) {
      setIsLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], zoom)
          }
          setCurrentLocation({
            lat: latitude,
            lng: longitude,
            name: 'Your Location'
          })
          setIsLoading(false)
        },
        () => {
          setError('Could not get your location')
          setIsLoading(false)
        }
      )
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Map</h3>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-gray-100 dark:bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 z-50">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
              <Loader className="w-6 h-6 text-blue-600" />
            </motion.div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-2 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full h-full rounded-lg overflow-hidden"
          style={{ height }}
        />

        {/* Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-40">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={zoomIn}
            className="p-2.5 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <span className="text-lg font-bold text-gray-700 dark:text-white">+</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={zoomOut}
            className="p-2.5 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <span className="text-lg font-bold text-gray-700 dark:text-white">−</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={locateMe}
            className="p-2.5 bg-blue-600 dark:bg-blue-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-white"
          >
            <Navigation className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Footer */}
      {currentLocation && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-xs">
          <p className="text-gray-600 dark:text-gray-300">
            <strong>{currentLocation.name}</strong><br />
            Lat: {currentLocation.lat.toFixed(4)}°, Lng: {currentLocation.lng.toFixed(4)}°
          </p>
        </div>
      )}
    </div>
  )
}
