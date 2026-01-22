import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'
import { logger } from '@/lib/logger'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Uncaught error', error, {
      componentStack: errorInfo.componentStack,
      errorName: error.name
    })
    
    // Enhanced error logging for undefined variables
    if (error.message.includes('is not defined') || error.message.includes('is undefined')) {
      logger.error('[ErrorBoundary] Undefined variable error detected', error, {
        message: error.message,
        componentStack: errorInfo.componentStack,
        errorName: error.name,
        stack: error.stack
      })
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-background p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4 text-sm opacity-90">
                {this.state.error?.message || 'An unexpected error occurred.'}
              </p>
              {this.state.error?.message?.includes('is not defined') && (
                <div className="mb-4 p-3 bg-destructive/10 rounded-md border border-destructive/20">
                  <p className="text-xs font-semibold mb-1">Possible Cause:</p>
                  <p className="text-xs opacity-90">
                    A variable is being used but hasn't been declared. Check the component's state declarations and imports.
                  </p>
                  {this.state.error?.stack && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer opacity-70">View Stack Trace</summary>
                      <pre className="mt-2 text-xs opacity-60 overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reload Application
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}
