/**
 * Settings Data Component
 * Handles data export/import and backup
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Upload } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { settingsSync } from '@/services/settings-sync'

export function SettingsData() {
  const { toast } = useToast()

  const handleExport = async () => {
    try {
      const data = await window.ipcRenderer.invoke('db:export-data')
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoiceforge-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({ title: "Backup Exported", description: "Data exported successfully" })
    } catch (error) {
      console.error('Export failed:', error)
      toast({ title: "Export Failed", description: "Failed to export data", variant: "destructive" })
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        await window.ipcRenderer.invoke('db:import-data', data)
        toast({ title: "Data Imported", description: "Data imported successfully. Please restart the application." })
        setTimeout(() => window.location.reload(), 2000)
      }
      reader.readAsText(file)
    } catch (error) {
      console.error('Import failed:', error)
      toast({ title: "Import Failed", description: "Failed to import data", variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>Manage your application data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-lg bg-muted/20">
          <h4 className="font-medium mb-2">Export/Import Settings</h4>
          <p className="text-sm text-muted-foreground mb-4">Export or import your application settings, themes, and preferences.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              settingsSync.export()
              toast({ title: 'Settings exported successfully' })
            }}>
              <Download className="mr-2 h-4 w-4" /> Export Settings
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    try {
                      await settingsSync.import(file)
                      toast({ title: 'Settings imported successfully' })
                    } catch (error) {
                      toast({ title: 'Failed to import settings', variant: 'destructive' })
                    }
                  }
                }}
              />
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Import Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-muted/20">
          <h4 className="font-medium mb-2">Backup Data</h4>
          <p className="text-sm text-muted-foreground mb-4">Download a copy of all your invoices, clients, products, and settings.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export Backup
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImport}
              />
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Import Backup
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-destructive/10">
          <h4 className="font-medium text-destructive mb-2">Reset Application</h4>
          <p className="text-sm text-muted-foreground mb-4">Warning: This will delete all your data permanently.</p>
          <Button variant="destructive">
            Reset All Data
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

