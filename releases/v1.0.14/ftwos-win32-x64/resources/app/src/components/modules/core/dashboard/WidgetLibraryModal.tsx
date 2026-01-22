/**
 * Widget Library Modal Component
 * Displays the widget library for adding widgets to the dashboard
 */

import React, { useState } from 'react'
import { LayoutGrid, X, Search, Settings, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface WidgetDefinition {
  type: string
  title: string
  description: string
  category: string
  icon: React.ComponentType<{ className?: string }>
  preview?: string
  tags?: string[]
  config?: any
}

interface WidgetLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  definitions: WidgetDefinition[]
  widgets: Array<{ id: string; type: string }>
  onAddWidget: (type: string) => void
  onResetLayout: () => void
}

export function WidgetLibraryModal({
  isOpen,
  onClose,
  definitions,
  widgets,
  onAddWidget,
  onResetLayout
}: WidgetLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  if (!isOpen) return null

  const filteredDefinitions = definitions
    .filter((w) => selectedCategory === 'all' || w.category === selectedCategory)
    .filter((w) => w.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-7xl h-[85vh] rounded-t-3xl shadow-2xl bg-white border border-gray-200 flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 relative z-10 bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Widget Library</h2>
              <p className="text-sm text-gray-500">Add modules to customize your workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-gray-200 flex gap-4 items-center relative z-10 bg-gray-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'productivity', 'finance', 'dev', 'system', 'fun'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-semibold uppercase transition-colors',
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Widget Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {filteredDefinitions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <LayoutGrid className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg mb-2 font-medium">No widgets found</p>
              <p className="text-gray-500 text-sm">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDefinitions.map((w) => {
                const isAdded = widgets.some((wid) => wid.type === w.type)
                const Icon = w.icon
                return (
                  <div
                    key={w.type}
                    className="flex flex-col text-left p-5 border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md rounded-xl group relative overflow-hidden transition-all"
                  >
                    {/* Preview Badge */}
                    {w.preview && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                          Preview
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2.5 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      {isAdded && (
                        <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                          Added
                        </Badge>
                      )}
                    </div>

                    <span className="block text-base font-semibold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                      {w.title}
                    </span>
                    <span className="block text-sm text-gray-600 mb-4 line-clamp-2">
                      {w.description}
                    </span>

                    {/* Widget Preview */}
                    {w.preview && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1 font-medium">Preview:</div>
                        <div className="text-xs text-gray-600">{w.preview}</div>
                      </div>
                    )}

                    {/* Tags */}
                    {w.tags && w.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {w.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-auto pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          if (w.config) {
                            // Show configuration wizard
                            // For now, just add the widget
                            onAddWidget(w.type)
                          } else {
                            onAddWidget(w.type)
                          }
                          onClose()
                        }}
                        disabled={isAdded}
                        className={cn(
                          'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          isAdded
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        )}
                      >
                        {isAdded ? 'Already Added' : 'Add Widget'}
                      </button>
                      {w.config && (
                        <button
                          onClick={() => {
                            // Show configuration dialog
                            onAddWidget(w.type)
                            onClose()
                          }}
                          className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors border border-gray-200"
                          title="Configure"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-white">
          <p className="text-xs text-gray-500">{widgets.length} active modules</p>
          <button
            onClick={() => {
              onResetLayout()
              onClose()
            }}
            className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 inline mr-1.5" /> Reset Layout
          </button>
        </div>
      </div>
    </div>
  )
}

