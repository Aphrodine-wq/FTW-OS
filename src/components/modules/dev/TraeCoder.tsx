import React, { useState, useEffect, useRef } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { Loader2 } from 'lucide-react'
// Use Monaco Editor directly - bypass React wrapper to avoid initialization issues
import { initializeMonaco, isMonacoReady } from '@/lib/monaco-config'
import 'monaco-editor/min/vs/editor/editor.main.css'
import { 
  Play, Save, Terminal, Code, FileCode, 
  Settings, Maximize2, Minimize2, Sidebar,
  Paperclip, Send, Bot, X, Folder
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/services/utils'

interface TraeCoderProps {
  initialFile?: string
}

export function TraeCoder({ initialFile }: TraeCoderProps) {
  const [code, setCode] = useState('// Welcome to Trae SOLO Coder\n// Start building your dream.\n\nconsole.log("Hello World");')
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('// Select a file to view code')
  const [currentProject, setCurrentProject] = useState<string | null>(null)
  const [files, setFiles] = useState<any[]>([])
  const [monacoReady, setMonacoReady] = useState(false)
  const [monacoError, setMonacoError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoEditorRef = useRef<any>(null)

  const [aiPanelOpen, setAiPanelOpen] = useState(true)
  const [aiMessage, setAiMessage] = useState('')
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)

  // Initialize Monaco Editor directly (no React wrapper)
  useEffect(() => {
    const maxRetries = 3
    let attemptCount = 0
    
    const tryInitialize = async () => {
      try {
        console.log(`[TraeCoder] Initializing Monaco Editor directly (attempt ${attemptCount + 1}/${maxRetries})...`)
        
        // Initialize Monaco
        await initializeMonaco()
        
        // Verify Monaco is actually available
        const monacoModule = await import('monaco-editor')
        if (!monacoModule || !monacoModule.editor || typeof monacoModule.editor.create !== 'function') {
          throw new Error('Monaco Editor API not available after initialization')
        }
        
        // Verify using our helper function
        if (!isMonacoReady()) {
          throw new Error('Monaco Editor verification failed')
        }
        
        console.log('[TraeCoder] Monaco Editor initialized successfully')
        setMonacoReady(true)
        setMonacoError(null)
        
        // Create editor instance when container is ready
        if (editorRef.current && !monacoEditorRef.current) {
          createEditorInstance(monacoModule)
        }
      } catch (error: any) {
        attemptCount++
        const errorMessage = error?.message || 'Unknown error'
        console.error(`[TraeCoder] Monaco initialization failed (attempt ${attemptCount}):`, error)
        
        if (attemptCount < maxRetries) {
          // Retry after a delay
          const delay = attemptCount * 1000 // Exponential backoff: 1s, 2s, 3s
          console.log(`[TraeCoder] Retrying Monaco initialization in ${delay}ms...`)
          setTimeout(() => {
            setRetryCount(attemptCount)
            tryInitialize()
          }, delay)
        } else {
          // All retries failed
          setMonacoError(`Failed to initialize Monaco Editor after ${maxRetries} attempts: ${errorMessage}`)
          setMonacoReady(false)
        }
      }
    }
    
    tryInitialize()
  }, [])
  
  // Create Monaco editor instance
  const createEditorInstance = async (monaco: any) => {
    if (!editorRef.current || monacoEditorRef.current) return
    
    try {
      console.log('[TraeCoder] Creating Monaco editor instance...')
      
      // Define theme
      monaco.editor.defineTheme('trae-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#09090b',
        }
      })
      
      // Create editor
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value: code,
        language: 'typescript',
        theme: 'trae-dark',
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'JetBrains Mono',
        padding: { top: 20 },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        automaticLayout: true,
        wordWrap: 'on'
      })
      
      // Listen for changes
      monacoEditorRef.current.onDidChangeModelContent(() => {
        const newValue = monacoEditorRef.current.getValue()
        setCode(newValue)
      })
      
      monaco.editor.setTheme('trae-dark')
      console.log('[TraeCoder] Monaco editor instance created successfully')
    } catch (error) {
      console.error('[TraeCoder] Failed to create Monaco editor instance:', error)
      setMonacoError(`Failed to create editor: ${error}`)
    }
  }
  
  // Create editor when ready and container exists
  useEffect(() => {
    if (monacoReady && editorRef.current && !monacoEditorRef.current) {
      import('monaco-editor').then((monaco) => {
        createEditorInstance(monaco)
      })
    }
  }, [monacoReady])
  
  // Update editor content when code changes externally
  useEffect(() => {
    if (monacoEditorRef.current && monacoEditorRef.current.getValue() !== code) {
      monacoEditorRef.current.setValue(code)
    }
  }, [code])
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose()
        monacoEditorRef.current = null
      }
    }
  }, [])

  const handleOpenProject = async () => {
    try {
        const path = await window.ipcRenderer.invoke('dialog:open-directory')
        if (path) {
            setCurrentProject(path)
            const fileList = await window.ipcRenderer.invoke('files:list', path)
            setFiles(fileList)
            // Reset editor
            setActiveFile(null)
            setFileContent('// Project loaded. Select a file.')
        }
    } catch (e) {
        console.error('Failed to open project', e)
    }
  }

  const handleFileClick = async (file: any) => {
      if (file.isDirectory) {
          // TODO: Implement recursive expansion. For now, we assume simple list or add basic navigation
          return
      }
      
      try {
          const content = await window.ipcRenderer.invoke('files:read', file.path)
          setActiveFile(file.name)
          setFileContent(content)
      } catch (e) {
          console.error('Failed to read file', e)
      }
  }

  const handleSave = async () => {
      if (!currentProject || !activeFile) return
      // We need the full path. For now, let's find it in the file list
      const file = files.find(f => f.name === activeFile)
      if (file) {
          await window.ipcRenderer.invoke('files:write', { filePath: file.path, content: fileContent })
          // Show toast?
      }
  }

  // Initialize Terminal
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return

    const term = new XTerm({
      theme: {
        background: '#09090b',
        foreground: '#f4f4f5',
        cursor: '#2563eb',
        selectionBackground: 'rgba(37, 99, 235, 0.3)'
      },
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    // Delay initialization to ensure DOM is ready
    const initTimer = setTimeout(() => {
        if (!terminalRef.current) return

        term.open(terminalRef.current)
        
        // Safety check for dimensions before fitting
        requestAnimationFrame(() => {
            try {
                if (terminalRef.current && terminalRef.current.clientWidth > 0) {
                    fitAddon.fit()
                }
            } catch (e) {
                console.warn('Initial fit failed', e)
            }
        })
    }, 100)

    // Initialize backend PTY
    const termId = 'trae-coder-term'
    if (window.ipcRenderer) {
        window.ipcRenderer.invoke('terminal:create', termId)

        term.onData(data => {
            window.ipcRenderer.send('terminal:write', { id: termId, data })
        })

        const handleData = (_: any, data: string) => {
            term.write(data)
        }
        window.ipcRenderer.on(`terminal:data:${termId}`, handleData)
        
        // Cleanup
        return () => {
          term.dispose()
          window.ipcRenderer.off(`terminal:data:${termId}`, handleData)
          window.ipcRenderer.invoke('terminal:destroy', termId)
          resizeObserver.disconnect()
          clearTimeout(initTimer)
        }
    } else {
        // Fallback for non-electron environment
        term.writeln('Running in web mode. Terminal is simulated.')
    }

    xtermRef.current = term

    // Initial greeting
    term.writeln('\x1b[1;34mTrae SOLO Coder v1.1\x1b[0m')
    term.writeln('Interactive Environment Ready.\r\n')

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
        if (terminalRef.current && terminalRef.current.offsetParent) {
            requestAnimationFrame(() => {
                try {
                    fitAddon.fit()
                } catch (e) {
                    // Ignore resize errors if terminal is hidden
                }
            })
        }
    })
    resizeObserver.observe(terminalRef.current)

  }, [])

  // Auto-resize terminal when toggled
  useEffect(() => {
    if (terminalOpen) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'))
      }, 100)
    }
  }, [terminalOpen])

  const handleEditorMount = (editor: any, monaco: any) => {
    console.log('[TraeCoder] Editor mounted, Monaco object:', { 
      hasMonaco: !!monaco, 
      hasEditor: !!monaco?.editor,
      hasCreate: typeof monaco?.editor?.create === 'function'
    })
    
    // Verify Monaco is available
    if (!monaco) {
      console.error('[TraeCoder] Monaco object is undefined')
      setMonacoError('Monaco Editor object not available')
      return
    }
    
    if (!monaco.editor) {
      console.error('[TraeCoder] Monaco editor API not available')
      setMonacoError('Monaco Editor API not available')
      return
    }
    
    if (typeof monaco.editor.create !== 'function') {
      console.error('[TraeCoder] Monaco editor.create is not a function')
      setMonacoError('Monaco Editor create function not available')
      return
    }
    
    // Wait a bit to ensure Monaco is fully initialized
    setTimeout(() => {
      try {
        // Check if theme already exists
        let existingTheme
        try {
          existingTheme = monaco.editor.getTheme('trae-dark')
        } catch (e) {
          // Theme doesn't exist yet, which is fine
          existingTheme = null
        }
        
        if (!existingTheme) {
          monaco.editor.defineTheme('trae-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#09090b',
            }
          })
        }
        monaco.editor.setTheme('trae-dark')
        console.log('[TraeCoder] Monaco theme applied successfully')
      } catch (error) {
        console.error('[TraeCoder] Error setting Monaco theme:', error)
        setMonacoError(`Failed to configure Monaco Editor: ${error}`)
      }
    }, 100)
  }

  const runCode = () => {
    if (xtermRef.current) {
        xtermRef.current.writeln(`\r\n\x1b[32m$ node ${activeFile}\x1b[0m\r\n`)
        setTimeout(() => {
            xtermRef.current?.writeln('Hello World')
        }, 500)
    }
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden rounded-xl border border-zinc-800">
      {/* Toolbar */}
      <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <Code className="h-4 w-4 text-blue-500" />
            <span>Trae Coder</span>
          </div>
          <div className="h-4 w-[1px] bg-zinc-700" />
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded-md text-xs">
            <FileCode className="h-3 w-3 text-yellow-500" />
            {activeFile}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 hover:bg-zinc-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle Sidebar"
          >
            <Sidebar className="h-4 w-4" />
          </Button>
          
          <Button 
            size="sm" 
            variant="ghost" 
            className={cn("h-8 gap-2 hover:bg-zinc-800", aiPanelOpen && "bg-purple-500/10 text-purple-400")}
            onClick={() => setAiPanelOpen(!aiPanelOpen)}
            title="Toggle AI Assistant"
          >
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">AI Chat</span>
          </Button>

          <Button 
            size="sm" 
            className="h-8 gap-2 bg-green-600 hover:bg-green-700 text-white font-medium"
            onClick={runCode}
          >
            <Play className="h-3 w-3" /> Run
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className={cn("h-8 w-8 p-0 hover:bg-zinc-800", terminalOpen && "text-blue-400 bg-blue-500/10")}
            onClick={() => setTerminalOpen(!terminalOpen)}
          >
            <Terminal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 border-r border-zinc-800 bg-zinc-900/30 flex flex-col">
            <div className="p-3 border-b border-zinc-800 flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Explorer</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-zinc-800" onClick={handleOpenProject}>
                <Folder className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {!currentProject ? (
                <div className="p-4 text-center">
                  <div className="text-xs text-zinc-500 mb-2">No Project Open</div>
                  <Button variant="outline" size="sm" className="w-full text-xs h-7 border-zinc-700 hover:bg-zinc-800" onClick={handleOpenProject}>
                    Open Folder
                  </Button>
                </div>
              ) : (
                files.map(file => (
                  <div 
                    key={file.path}
                    onClick={() => handleFileClick(file)}
                    className={cn(
                      "px-4 py-2 text-sm cursor-pointer flex items-center gap-2 hover:bg-zinc-800/50",
                      activeFile === file.name ? "bg-blue-500/10 text-blue-400 border-l-2 border-blue-500" : "text-zinc-400 border-l-2 border-transparent"
                    )}
                  >
                    {file.isDirectory ? <Folder className="h-4 w-4 text-yellow-500" /> : <FileCode className="h-4 w-4 opacity-70" />}
                    <span className="truncate">{file.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Editor & Terminal Split */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className={cn("flex-1 relative transition-all duration-300", terminalOpen ? "h-2/3" : "h-full")}>
            {monacoError ? (
              <div className="h-full w-full flex items-center justify-center bg-zinc-950">
                <div className="text-center max-w-md p-6">
                  <div className="text-red-400 text-lg font-semibold mb-2">Monaco Editor Failed to Load</div>
                  <p className="text-zinc-400 text-sm mb-4">{monacoError}</p>
                  <Button 
                    onClick={() => {
                      setMonacoError(null)
                      setMonacoReady(false)
                      setRetryCount(0)
                      // Trigger re-initialization
                      initializeMonaco()
                        .then(() => {
                          setMonacoReady(true)
                          setMonacoError(null)
                        })
                        .catch((error) => {
                          setMonacoError(`Retry failed: ${error?.message || 'Unknown error'}`)
                        })
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : !monacoReady ? (
              <div className="h-full w-full flex items-center justify-center bg-zinc-950">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-zinc-400 text-sm">Initializing Monaco Editor...</p>
                  {retryCount > 0 && (
                    <p className="text-zinc-500 text-xs mt-2">Retry attempt {retryCount}...</p>
                  )}
                </div>
              </div>
            ) : (
              <div 
                ref={editorRef}
                className="h-full w-full bg-zinc-950"
                style={{ minHeight: '200px' }}
              />
            )}
          </div>

          {/* AI Chat Panel (Overlay) */}
          {aiPanelOpen && (
            <div className="absolute top-4 right-4 w-80 bottom-4 bg-zinc-900/95 backdrop-blur border border-zinc-700 rounded-xl shadow-2xl flex flex-col overflow-hidden z-10">
                <div className="p-3 border-b border-zinc-700 flex items-center justify-between bg-zinc-800/50">
                    <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-semibold text-zinc-200">Trae AI Assistant</span>
                    </div>
                    <button onClick={() => setAiPanelOpen(false)} className="text-zinc-500 hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="bg-zinc-800 rounded-lg p-3 text-sm text-zinc-300">
                            Hello! I'm your local coding assistant. How can I help you improve this code?
                        </div>
                    </div>
                </div>

                <div className="p-3 border-t border-zinc-700 bg-zinc-800/30">
                    <div className="relative flex items-center gap-2 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 focus-within:border-purple-500 transition-colors">
                        <button className="text-zinc-500 hover:text-zinc-300" title="Add Context">
                            <Paperclip className="h-4 w-4" />
                        </button>
                        <input 
                            type="text" 
                            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500"
                            placeholder="Ask a question..."
                            value={aiMessage}
                            onChange={(e) => setAiMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && setAiMessage('')}
                        />
                        <button className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
                            <Send className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
          )}

          {/* Terminal Panel */}
          {terminalOpen && (
            <div className="h-1/3 border-t border-zinc-800 bg-black flex flex-col min-h-[150px]">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Terminal</span>
                <div className="flex gap-2">
                  <button onClick={() => xtermRef.current?.clear()} className="text-xs text-zinc-500 hover:text-zinc-300">Clear</button>
                  <button onClick={() => setTerminalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                    <Minimize2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-2 overflow-hidden relative">
                <div ref={terminalRef} className="absolute inset-2" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
