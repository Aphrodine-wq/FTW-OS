import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Folder, FileText, Upload, Search, Grid, List, 
  MoreVertical, File, Image as ImageIcon, Download, 
  Trash2, FolderPlus, ArrowLeft, Sparkles, Loader2,
  Check, AlertCircle, Filter
} from 'lucide-react'
import { cn } from '@/services/utils'
import { toast } from 'sonner'
import { DocumentClassifier, DOCUMENT_CATEGORIES, type DocumentCategory } from '@/services/intelligence/DocumentClassifier'

interface FileSystemItem {
  name: string
  path: string
  isDirectory: boolean
  size: number
  updatedAt: string
  type: string
  category?: DocumentCategory
}

interface SortProgress {
  current: number
  total: number
  currentFile: string
  results: Array<{ file: string; category?: string; success: boolean; error?: string }>
}

export function DocumentHub() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [currentPath, setCurrentPath] = useState<string>('')
  const [files, setFiles] = useState<FileSystemItem[]>([])
  const [loading, setLoading] = useState(false)
  
  // AI Sorting state
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isSorting, setIsSorting] = useState(false)
  const [sortProgress, setSortProgress] = useState<SortProgress | null>(null)
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  
  // Cache for faster navigation
  const fileCache = useRef<Map<string, FileSystemItem[]>>(new Map())

  // Check Ollama availability on mount
  useEffect(() => {
    DocumentClassifier.isOllamaAvailable().then(setOllamaAvailable)
  }, [])

  // Initial load
  useEffect(() => {
    loadDirectory()
  }, [])

  const loadDirectory = useCallback(async (path?: string) => {
    setLoading(true)
    const cacheKey = path || 'documents'
    
    // Use cache if available for instant display
    if (fileCache.current.has(cacheKey)) {
      setFiles(fileCache.current.get(cacheKey)!)
      setCurrentPath(path || await window.ipcRenderer.invoke('fs:get-documents'))
    }
    
    try {
      const targetPath = path || await window.ipcRenderer.invoke('fs:get-documents')
      const items = await window.ipcRenderer.invoke('fs:ls', targetPath)
      setFiles(items)
      setCurrentPath(targetPath)
      fileCache.current.set(cacheKey, items)
      setSelectedFiles(new Set()) // Clear selection on navigation
    } catch (e) {
      console.error('Failed to load directory:', e)
      toast.error('Failed to load directory')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleNavigate = (item: FileSystemItem) => {
    if (item.isDirectory) {
      loadDirectory(item.path)
    }
  }

  const handleUp = () => {
    if (!currentPath) return
    const separator = currentPath.includes('\\') ? '\\' : '/'
    const parent = currentPath.split(separator).slice(0, -1).join(separator)
    if (parent) loadDirectory(parent)
  }

  const handleUpload = () => {
    console.log('Upload clicked')
  }

  // Toggle file selection
  const toggleFileSelection = (e: React.MouseEvent, filePath: string) => {
    e.stopPropagation()
    setSelectedFiles(prev => {
      const next = new Set(prev)
      if (next.has(filePath)) {
        next.delete(filePath)
      } else {
        next.add(filePath)
      }
      return next
    })
  }

  // Select all files (not directories)
  const selectAllFiles = () => {
    const fileItems = files.filter(f => !f.isDirectory && isSortableFile(f.type))
    setSelectedFiles(new Set(fileItems.map(f => f.path)))
  }

  // Check if file type is sortable
  const isSortableFile = (type: string) => {
    return ['txt', 'md', 'html', 'htm', 'json', 'csv'].includes(type.toLowerCase())
  }

  // AI Sort selected files
  const handleAISort = async () => {
    if (selectedFiles.size === 0) {
      toast.error('Please select files to sort')
      return
    }

    if (!ollamaAvailable) {
      toast.error('Ollama is not available. Please start Ollama and try again.')
      return
    }

    // Ensure category folders exist
    await window.ipcRenderer.invoke('document:ensure-folders')

    setIsSorting(true)
    const results: SortProgress['results'] = []
    const filesToSort = Array.from(selectedFiles)
    
    setSortProgress({ current: 0, total: filesToSort.length, currentFile: '', results: [] })

    for (let i = 0; i < filesToSort.length; i++) {
      const filePath = filesToSort[i]
      const fileName = filePath.split(/[/\\]/).pop() || filePath
      
      setSortProgress(prev => ({
        ...prev!,
        current: i + 1,
        currentFile: fileName
      }))

      const result = await DocumentClassifier.classifyAndMove(filePath)
      
      if (result.success) {
        results.push({ file: fileName, category: result.category, success: true })
        
        // Save to registry
        await window.ipcRenderer.invoke('db:add-document-record', {
          id: crypto.randomUUID(),
          originalPath: filePath,
          currentPath: result.newPath,
          category: result.category,
          confidence: 0.8, // We don't have confidence in the response currently
          sortedAt: new Date().toISOString()
        })
      } else {
        results.push({ file: fileName, success: false, error: result.error, category: result.category })
      }
      
      setSortProgress(prev => ({ ...prev!, results }))
    }

    setIsSorting(false)
    setSelectedFiles(new Set())
    
    // Refresh directory
    loadDirectory(currentPath)
    
    // Show summary
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length
    
    if (successCount > 0 && failCount === 0) {
      toast.success(`Successfully sorted ${successCount} document${successCount > 1 ? 's' : ''}`)
    } else if (successCount > 0 && failCount > 0) {
      toast.warning(`Sorted ${successCount} documents, ${failCount} failed`)
    } else {
      toast.error(`Failed to sort documents`)
    }
    
    setTimeout(() => setSortProgress(null), 3000)
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

  // Filter files by category
  const filteredFiles = categoryFilter === 'all' 
    ? files 
    : files.filter(f => f.isDirectory && DOCUMENT_CATEGORIES.includes(f.name as DocumentCategory))

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleUp} disabled={!currentPath}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Documents</h2>
                <p className="text-xs text-slate-500 font-mono truncate max-w-md" title={currentPath}>
                    {currentPath || 'Loading...'}
                </p>
            </div>
        </div>

        <div className="flex items-center gap-3">
            {/* Ollama Status */}
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
              ollamaAvailable === true && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
              ollamaAvailable === false && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
              ollamaAvailable === null && "bg-slate-100 text-slate-500"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                ollamaAvailable === true && "bg-green-500",
                ollamaAvailable === false && "bg-red-500",
                ollamaAvailable === null && "bg-slate-400"
              )} />
              {ollamaAvailable === true ? 'AI Ready' : ollamaAvailable === false ? 'AI Offline' : 'Checking...'}
            </div>

            {/* Selection controls */}
            {selectedFiles.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  {selectedFiles.size} selected
                </span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 text-xs"
                  onClick={() => setSelectedFiles(new Set())}
                >
                  Clear
                </Button>
              </div>
            )}

            {/* AI Sort Button */}
            <Button 
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              onClick={handleAISort}
              disabled={selectedFiles.size === 0 || isSorting || !ollamaAvailable}
            >
              {isSorting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sorting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Sort with AI
                </>
              )}
            </Button>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search files..." className="pl-9 w-48 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600" />
            </div>
            
            <Button variant="outline" size="sm" onClick={selectAllFiles} className="gap-1">
              <Check className="h-3 w-3" /> Select All
            </Button>
            
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button 
                    onClick={() => setView('grid')}
                    className={cn("p-2 rounded-md transition-all", view === 'grid' ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500")}
                >
                    <Grid className="h-4 w-4" />
                </button>
                <button 
                    onClick={() => setView('list')}
                    className={cn("p-2 rounded-md transition-all", view === 'list' ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500")}
                >
                    <List className="h-4 w-4" />
                </button>
            </div>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleUpload}>
                <Upload className="h-4 w-4" /> Upload
            </Button>
        </div>
      </div>

      {/* Sorting Progress */}
      {sortProgress && (
        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Sorting {sortProgress.current} of {sortProgress.total}
              </span>
            </div>
            <span className="text-xs text-slate-500 truncate max-w-xs">
              {sortProgress.currentFile}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(sortProgress.current / sortProgress.total) * 100}%` }}
            />
          </div>
          {sortProgress.results.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {sortProgress.results.slice(-5).map((r, i) => (
                <span 
                  key={i} 
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    r.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}
                >
                  {r.success ? r.category : 'Failed'}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-800/50">
        {view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {filteredFiles.map(file => {
                    const isSelected = selectedFiles.has(file.path)
                    const isSortable = !file.isDirectory && isSortableFile(file.type)
                    
                    return (
                      <div 
                          key={file.path} 
                          className={cn(
                            "group relative bg-white dark:bg-slate-800 p-4 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center gap-3",
                            isSelected 
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md" 
                              : "border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-md"
                          )}
                          onClick={() => handleNavigate(file)}
                      >
                          {/* Selection checkbox */}
                          {isSortable && (
                            <button
                              onClick={(e) => toggleFileSelection(e, file.path)}
                              className={cn(
                                "absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                isSelected 
                                  ? "bg-blue-600 border-blue-600 text-white" 
                                  : "border-slate-300 hover:border-blue-400 bg-white dark:bg-slate-700"
                              )}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </button>
                          )}
                          
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-3 w-3" /></Button>
                          </div>
                          <div className="p-2 transition-transform group-hover:scale-110 duration-300">
                              {getIcon(file.type, file.isDirectory)}
                          </div>
                          <div className="w-full">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate w-full" title={file.name}>{file.name}</p>
                              <p className="text-xs text-slate-400 mt-1">{new Date(file.updatedAt).toLocaleDateString()} • {file.isDirectory ? 'Folder' : formatSize(file.size)}</p>
                          </div>
                      </div>
                    )
                })}
                
                {/* Add New Placeholder */}
                <button 
                    onClick={handleUpload}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all gap-2 min-h-[140px]"
                >
                    <FolderPlus className="h-8 w-8 opacity-50" />
                    <span className="text-xs font-bold uppercase tracking-wider">Add New</span>
                </button>
            </div>
        ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase text-slate-500 tracking-wider">
                        <tr>
                            <th className="p-4 w-12"></th>
                            <th className="p-4 w-10"></th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Size</th>
                            <th className="p-4">Modified</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredFiles.map(file => {
                            const isSelected = selectedFiles.has(file.path)
                            const isSortable = !file.isDirectory && isSortableFile(file.type)
                            
                            return (
                              <tr 
                                key={file.path} 
                                className={cn(
                                  "transition-colors group cursor-pointer",
                                  isSelected ? "bg-blue-50 dark:bg-blue-900/30" : "hover:bg-slate-50/80 dark:hover:bg-slate-700/50"
                                )} 
                                onClick={() => handleNavigate(file)}
                              >
                                  <td className="p-4" onClick={e => e.stopPropagation()}>
                                    {isSortable && (
                                      <button
                                        onClick={(e) => toggleFileSelection(e, file.path)}
                                        className={cn(
                                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                          isSelected 
                                            ? "bg-blue-600 border-blue-600 text-white" 
                                            : "border-slate-300 hover:border-blue-400 bg-white dark:bg-slate-700"
                                        )}
                                      >
                                        {isSelected && <Check className="h-3 w-3" />}
                                      </button>
                                    )}
                                  </td>
                                  <td className="p-4">
                                      {getIcon(file.type, file.isDirectory)}
                                  </td>
                                  <td className="p-4 font-medium text-slate-700 dark:text-slate-200">{file.name}</td>
                                  <td className="p-4 text-sm text-slate-500 font-mono">{file.isDirectory ? '--' : formatSize(file.size)}</td>
                                  <td className="p-4 text-sm text-slate-500">{new Date(file.updatedAt).toLocaleDateString()}</td>
                                  <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="flex justify-end gap-1">
                                          <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                                      </div>
                                  </td>
                              </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  )
}
