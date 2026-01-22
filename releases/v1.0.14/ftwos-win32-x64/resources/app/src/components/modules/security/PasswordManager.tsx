import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Key, Shield, Copy, Eye, EyeOff, 
  Plus, Search, Lock, RefreshCw, Trash2
} from 'lucide-react'
import { cn } from '@/services/utils'

export function PasswordManager() {
  const [showPassword, setShowPassword] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [credentials, setCredentials] = useState<any[]>([]) // Use empty state initially

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Secure Vault</h2>
          <p className="text-muted-foreground">Encrypted storage for credentials and API keys</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4" /> Add Credential
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Security Health */}
        <Card className="md:col-span-3 bg-slate-900 text-white border-slate-800">
            <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-full">
                        <Shield className="h-8 w-8 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Vault Status: Secure</h3>
                        <p className="text-slate-400 text-sm">Master key encrypted with AES-256-GCM. Last backup: 4 hours ago.</p>
                    </div>
                </div>
                <Button variant="outline" className="text-white border-slate-700 hover:bg-slate-800">
                    <RefreshCw className="h-4 w-4 mr-2" /> Rotate Master Key
                </Button>
            </CardContent>
        </Card>

        {/* Search & List */}
        <div className="md:col-span-3 space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Search vault..." 
                        className="pl-9"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <div className="grid grid-cols-12 gap-4 p-4 border-b bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <div className="col-span-4">Name</div>
                    <div className="col-span-3">Username/ID</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2">Last Used</div>
                    <div className="col-span-1 text-center">Actions</div>
                </div>
                {credentials.length === 0 ? (
                    <div className="col-span-12 p-12 flex flex-col items-center justify-center text-center text-slate-500">
                        <div className="p-4 bg-slate-100 rounded-full mb-4">
                            <Lock className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">Vault is empty</h3>
                        <p className="max-w-sm mt-2 mb-6">Store your API keys, passwords, and secrets securely. All data is encrypted locally.</p>
                        <Button onClick={() => {}} className="gap-2">
                            <Plus className="h-4 w-4" /> Add First Credential
                        </Button>
                    </div>
                ) : (
                    credentials.map(cred => (
                    <div key={cred.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors border-b last:border-0">
                        <div className="col-span-4 flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Key className="h-4 w-4 text-slate-600" />
                            </div>
                            <span className="font-medium">{cred.name}</span>
                        </div>
                        <div className="col-span-3 font-mono text-xs text-slate-600 truncate">
                            {cred.username}
                        </div>
                        <div className="col-span-2">
                            <span className="px-2 py-1 rounded-full bg-slate-100 text-xs text-slate-600">
                                {cred.category}
                            </span>
                        </div>
                        <div className="col-span-2 text-xs text-slate-500">
                            {cred.lastUsed}
                        </div>
                        <div className="col-span-1 flex justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard('mock-password')}>
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )))}
            </div>
        </div>
      </div>
    </div>
  )
}
