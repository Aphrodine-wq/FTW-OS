/**
 * Global Search Component
 * Search across all modules and content with filter support
 */

import React, { useState, useMemo } from 'react'
import { Search, FileText, DollarSign, Briefcase, User, Calendar, X } from 'lucide-react'
import { Command } from 'cmdk'
import { useDebouncedCallback } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface SearchResult {
  id: string
  title: string
  type: 'invoice' | 'task' | 'project' | 'client' | 'document'
  path: string
  icon: React.ComponentType<{ className?: string }>
}

interface SearchFilter {
  key: string
  value: string
}

export function GlobalSearch({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Parse filters from query string (e.g., "type:task status:open")
  const parseFilters = (q: string): SearchFilter[] => {
    const filters: SearchFilter[] = []
    const filterRegex = /(\w+):(\w+)/g
    let match
    while ((match = filterRegex.exec(q)) !== null) {
      filters.push({ key: match[1], value: match[2] })
    }
    return filters
  }

  // Extract base query without filters
  const extractBaseQuery = (q: string): string => {
    return q.replace(/\w+:\w+/g, '').trim()
  }

  const filters = useMemo(() => parseFilters(query), [query])
  const baseQuery = useMemo(() => extractBaseQuery(query), [query])

  // Mock search functions - replace with actual search implementations
  const searchInvoices = (q: string, filters: SearchFilter[]): SearchResult[] => {
    // In production, search actual invoice data
    return []
  }

  const searchTasks = (q: string, filters: SearchFilter[]): SearchResult[] => {
    // In production, search actual task data
    return []
  }

  const searchProjects = (q: string, filters: SearchFilter[]): SearchResult[] => {
    // In production, search actual project data
    return []
  }

  const searchClients = (q: string, filters: SearchFilter[]): SearchResult[] => {
    // In production, search actual client data
    return []
  }

  const searchDocuments = (q: string, filters: SearchFilter[]): SearchResult[] => {
    // In production, search actual document data
    return []
  }

  const performSearch = useDebouncedCallback((q: string, filters: SearchFilter[]) => {
    if (!q.trim() && filters.length === 0) {
      setResults([])
      return
    }

    const allResults = [
      ...searchInvoices(q, filters),
      ...searchTasks(q, filters),
      ...searchProjects(q, filters),
      ...searchClients(q, filters),
      ...searchDocuments(q, filters)
    ]

    setResults(allResults)
  }, 300)

  React.useEffect(() => {
    performSearch(baseQuery, filters)
  }, [baseQuery, filters, performSearch])

  const removeFilter = (filter: SearchFilter) => {
    const newQuery = query.replace(`${filter.key}:${filter.value}`, '').trim()
    setQuery(newQuery)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global Search" className="w-full">
          <div className="flex items-center border-b px-3">
            <Search className="h-5 w-5 text-slate-400 mr-2" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search... (type:task status:open)"
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
              autoFocus
            />
          </div>

          {/* Auto-detected filters */}
          {filters.length > 0 && (
            <div className="flex gap-2 p-2 border-b flex-wrap">
              {filters.map((filter, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1">
                  {filter.key}: {filter.value}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeFilter(filter)}
                  />
                </Badge>
              ))}
            </div>
          )}
          
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              {query ? 'No results found' : 'Start typing to search...'}
            </Command.Empty>

            {results.length > 0 && (
              <Command.Group heading="Results">
                {results.map((result) => {
                  const Icon = result.icon
                  return (
                    <Command.Item
                      key={result.id}
                      onSelect={() => {
                        onNavigate(result.path)
                        setIsOpen(false)
                      }}
                      className="flex items-center px-2 py-2 text-sm rounded-md cursor-pointer hover:bg-slate-100"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span className="flex-1">{result.title}</span>
                      <span className="text-xs text-slate-400 capitalize">{result.type}</span>
                    </Command.Item>
                  )
                })}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
