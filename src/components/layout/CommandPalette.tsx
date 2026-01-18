import React, { useEffect } from 'react'
import { Command } from 'cmdk'
import { Search } from 'lucide-react'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { CommandAction } from '@/lib/command-registry'

interface CommandPaletteProps {
  onNavigate: (page: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  setQuickCaptureOpen?: (open: boolean) => void
  setCreateInvoiceOpen?: (open: boolean) => void
  setCreateTaskOpen?: (open: boolean) => void
  toggleTheme?: () => void
  exportData?: () => void
  syncNow?: () => void
}

export function CommandPalette({
  onNavigate,
  open,
  setOpen,
  setQuickCaptureOpen,
  setCreateInvoiceOpen,
  setCreateTaskOpen,
  toggleTheme,
  exportData,
  syncNow
}: CommandPaletteProps) {
  const {
    search,
    setSearch,
    groupedCommands,
    recentCommandObjects,
    executeCommand
  } = useCommandPalette({
    navigate: onNavigate,
    setQuickCaptureOpen,
    setCreateInvoiceOpen,
    setCreateTaskOpen,
    toggleTheme,
    exportData,
    syncNow
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, setOpen])

  const handleSelect = (cmd: CommandAction) => {
    executeCommand(cmd)
    setOpen(false)
    setSearch('')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200">
        <Command label="Global Command Menu" className="w-full">
          <div className="flex items-center border-b px-3">
            <Search className="h-5 w-5 text-slate-400 mr-2" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2 space-y-1">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              No results found.
            </Command.Empty>

            {/* Recent commands (only when no search) */}
            {!search && recentCommandObjects.length > 0 && (
              <Command.Group heading="Recent" className="px-2 py-1.5 text-xs font-medium text-slate-500">
                {recentCommandObjects.map((cmd) => {
                  const Icon = cmd.icon
                  return (
                    <Command.Item
                      key={cmd.id}
                      onSelect={() => handleSelect(cmd)}
                      className="flex items-center px-2 py-2 text-sm rounded-md cursor-pointer hover:bg-slate-100 aria-selected:bg-slate-100"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span className="flex-1">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="ml-auto text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </Command.Item>
                  )
                })}
              </Command.Group>
            )}

            {/* Grouped commands */}
            {Object.entries(groupedCommands).map(([category, commands]) => (
              <Command.Group
                key={category}
                heading={category}
                className="px-2 py-1.5 text-xs font-medium text-slate-500"
              >
                {commands.map((cmd) => {
                  const Icon = cmd.icon
                  return (
                    <Command.Item
                      key={cmd.id}
                      onSelect={() => handleSelect(cmd)}
                      className="flex items-center px-2 py-2 text-sm rounded-md cursor-pointer hover:bg-slate-100 aria-selected:bg-slate-100"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span className="flex-1">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="ml-auto text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </Command.Item>
                  )
                })}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
