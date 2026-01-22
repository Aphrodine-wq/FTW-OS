/**
 * Command Palette Hook
 * Manages command palette state, search, and recent commands
 */

import { useState, useMemo, useEffect } from 'react'
import Fuse from 'fuse.js'
import { CommandAction, getAllCommands } from '@/lib/command-registry'

interface UseCommandPaletteOptions {
  navigate: (page: string) => void
  setQuickCaptureOpen?: (open: boolean) => void
  setCreateInvoiceOpen?: (open: boolean) => void
  setCreateTaskOpen?: (open: boolean) => void
  toggleTheme?: () => void
  exportData?: () => void
  syncNow?: () => void
}

export function useCommandPalette(options: UseCommandPaletteOptions) {
  const [search, setSearch] = useState('')
  const [recentCommands, setRecentCommands] = useState<string[]>([])

  // Load recent commands from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ftw-recent-commands')
    if (saved) {
      try {
        setRecentCommands(JSON.parse(saved))
      } catch {
        setRecentCommands([])
      }
    }
  }, [])

  // Get all commands
  const allCommands = useMemo(() => {
    return getAllCommands(options.navigate, {
      setQuickCaptureOpen: options.setQuickCaptureOpen,
      setCreateInvoiceOpen: options.setCreateInvoiceOpen,
      setCreateTaskOpen: options.setCreateTaskOpen,
      toggleTheme: options.toggleTheme,
      exportData: options.exportData,
      syncNow: options.syncNow
    })
  }, [
    options.navigate,
    options.setQuickCaptureOpen,
    options.setCreateInvoiceOpen,
    options.setCreateTaskOpen,
    options.toggleTheme,
    options.exportData,
    options.syncNow
  ])

  // Setup fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(allCommands, {
      keys: ['label', 'keywords', 'category'],
      threshold: 0.3,
      includeScore: true
    })
  }, [allCommands])

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search.trim()) {
      return allCommands
    }

    const results = fuse.search(search)
    return results.map(result => result.item)
  }, [search, fuse, allCommands])

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const grouped: Record<string, CommandAction[]> = {}
    
    filteredCommands.forEach(cmd => {
      if (!grouped[cmd.category]) {
        grouped[cmd.category] = []
      }
      grouped[cmd.category].push(cmd)
    })

    return grouped
  }, [filteredCommands])

  // Execute command and track recent
  const executeCommand = (cmd: CommandAction) => {
    try {
      cmd.action()
      
      // Update recent commands
      const updated = [cmd.id, ...recentCommands.filter(id => id !== cmd.id)].slice(0, 5)
      setRecentCommands(updated)
      localStorage.setItem('ftw-recent-commands', JSON.stringify(updated))
    } catch (error) {
      console.error('Error executing command:', error)
    }
  }

  // Get recent command objects
  const recentCommandObjects = useMemo(() => {
    return recentCommands
      .map(id => allCommands.find(cmd => cmd.id === id))
      .filter((cmd): cmd is CommandAction => cmd !== undefined)
  }, [recentCommands, allCommands])

  return {
    search,
    setSearch,
    filteredCommands,
    groupedCommands,
    recentCommandObjects,
    executeCommand,
    allCommands
  }
}

