import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Folder, FileText, Upload, Search, Grid, List, 
  MoreVertical, File, Image as ImageIcon, Download, 
  Trash2, FolderPlus, Clock, ArrowLeft
} from 'lucide-react'
import { cn } from '@/services/utils'

interface FileSystemItem {
  name: string
  path: string
  isDirectory: boolean
  size: number
  updatedAt: string
  type: string
}

export function DocumentHub() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [currentPath, setCurrentPath] = useState<string>('')
  const [files, setFiles] = useState<FileSystemItem[]>([])
  const [loading, setLoading] = useState(false)

  // Initial load
  useEffect(() => {
    loadDirectory()
  }, [])

  const loadDirectory = async (path?: string) => {
    setLoading(true)
    try {
      const targetPath = path || await window.ipcRenderer.invoke('fs:get-documents')
      const items = await window.ipcRenderer.invoke('fs:ls', targetPath)
      setFiles(items)
      setCurrentPath(targetPath)
    } catch (e) {
      console.error('Failed to load directory:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleNavigate = (item: FileSystemItem) => {
    if (item.isDirectory) {
      loadDirectory(item.path)
    }
  }

  const handleUp = () => {
    if (!currentPath) return
    // Simple parent directory logic for Windows/Unix
    const separator = currentPath.includes('\\') ? '\\' : '/'
    const parent = currentPath.split(separator).slice(0, -1).join(separator)
    if (parent) loadDirectory(parent)
  }

  const handleUpload = () => {
    // Placeholder for upload functionality
    console.log('Upload clicked')
  }

  const getIcon = (type: string, isDirectory: boolean) => {
    if (isDirectory) return <Folder className="h-10 w-10 text-blue-500 fill-blue-500/20" />
    
    switch (type.toLowerCase()) {
        case 'pdf': return <FileText className="h-10 w-10 text-red-500" />
        case 'doc': 
        case 'docx': return <FileText className="h-10 w-10 text-blue-600" />
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'svg': return <ImageIcon className="h-10 w-10 text-purple-500" />
        default: return <File className="h-10 w-10 text-slate-400" />
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleUp} disabled={!currentPath}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Documents</h2>
                <p className="text-xs text-slate-500 font-mono truncate max-w-md" title={currentPath}>
                    {currentPath || 'Loading...'}
                </p>
            </div>
        </div>


        <div className="flex items-center gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search files..." className="pl-9 w-64 bg-slate-50 border-slate-200" />
            </div>
            <div className="flex bg-slate-100 rounded-lg p-1">
                <button 
                    onClick={() => setView('grid')}
                    className={cn("p-2 rounded-md transition-all", view === 'grid' ? "bg-white shadow-sm text-blue-600" : "text-slate-500")}
                >
                    <Grid className="h-4 w-4" />
                </button>
                <button 
                    onClick={() => setView('list')}
                    className={cn("p-2 rounded-md transition-all", view === 'list' ? "bg-white shadow-sm text-blue-600" : "text-slate-500")}
                >
                    <List className="h-4 w-4" />
                </button>
            </div>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleUpload}>
                <Upload className="h-4 w-4" /> Upload
            </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        {view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {files.map(file => (
                    <div 
                        key={file.path} 
                        className="group relative bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center gap-3"
                        onClick={() => handleNavigate(file)}
                    >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-3 w-3" /></Button>
                        </div>
                        <div className="p-2 transition-transform group-hover:scale-110 duration-300">
                            {getIcon(file.type, file.isDirectory)}
                        </div>
                        <div className="w-full">
                            <p className="text-sm font-medium text-slate-700 truncate w-full" title={file.name}>{file.name}</p>
                            <p className="text-xs text-slate-400 mt-1">{new Date(file.updatedAt).toLocaleDateString()} • {file.isDirectory ? 'Folder' : formatSize(file.size)}</p>
                        </div>
                    </div>
                ))}
                
                {/* Add New Placeholder */}
                <button 
                    onClick={handleUpload}
                    className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all gap-2"
                >
                    <FolderPlus className="h-8 w-8 opacity-50" />
                    <span className="text-xs font-bold uppercase tracking-wider">Add New</span>
                </button>
            </div>
        ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500 tracking-wider">
                        <tr>
                            <th className="p-4 w-12"></th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Size</th>
                            <th className="p-4">Modified</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {files.map(file => (
                            <tr key={file.path} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => handleNavigate(file)}>
                                <td className="p-4">
                                    {getIcon(file.type, file.isDirectory)}
                                </td>
                                <td className="p-4 font-medium text-slate-700">{file.name}</td>
                                <td className="p-4 text-sm text-slate-500 font-mono">{file.isDirectory ? '--' : formatSize(file.size)}</td>
                                <td className="p-4 text-sm text-slate-500">{new Date(file.updatedAt).toLocaleDateString()}</td>
                                <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  )
}
