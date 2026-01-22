import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Edit, Mail, Phone, ArrowLeft, Trash2, MapPin } from 'lucide-react'
import { Client, Invoice } from '@/types/invoice'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { EmptyClientState } from '@/components/empty-states'

export function ClientManager() {
  const [clients, setClients] = useState<Client[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [search, setSearch] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [currentClient, setCurrentClient] = useState<Partial<Client>>({})
  const [sortField, setSortField] = useState<'name' | 'totalSpent' | 'lastActive'>('totalSpent')
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const savedClients = await window.ipcRenderer.invoke('db:get-clients') || []
    const savedInvoices = await window.ipcRenderer.invoke('db:get-invoices') || []
    setClients(savedClients)
    setInvoices(savedInvoices)
  }

  const handleSave = async () => {
    if (!currentClient.name) return

    const newClient = {
      ...currentClient,
      id: currentClient.id || Math.random().toString(36).substr(2, 9),
      createdAt: currentClient.createdAt || new Date(),
      updatedAt: new Date()
    } as Client

    let updatedClients
    if (currentClient.id) {
      updatedClients = clients.map(c => c.id === currentClient.id ? newClient : c)
    } else {
      updatedClients = [...clients, newClient]
    }

    await window.ipcRenderer.invoke('db:save-clients', updatedClients)
    setClients(updatedClients)
    setIsEditing(false)
    setCurrentClient({})
    if (selectedClient && selectedClient.id === newClient.id) setSelectedClient(newClient)

    toast({
      title: "Client Saved",
      description: `${newClient.name} has been saved.`
    })
  }

  // CRM Logic
  const getClientStats = (clientId: string) => {
    const clientInvoices = invoices.filter(inv => inv.clientId === clientId || inv.clientId === clients.find(c => c.id === clientId)?.name)
    const totalSpent = clientInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0)
    const lastInvoice = clientInvoices.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())[0]
    return { totalSpent, invoiceCount: clientInvoices.length, lastActive: lastInvoice?.issueDate }
  }

  const filteredClients = clients
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'name') return a.name.localeCompare(b.name)
      if (sortField === 'totalSpent') return getClientStats(b.id).totalSpent - getClientStats(a.id).totalSpent
      if (sortField === 'lastActive') {
        const dateA = getClientStats(a.id).lastActive || new Date(0)
        const dateB = getClientStats(b.id).lastActive || new Date(0)
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      }
      return 0
    })

  return (
    <div className="space-y-6 h-full flex flex-col">
      <AnimatePresence mode="wait">
        {!selectedClient ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
                <p className="text-muted-foreground">Manage your relationships</p>
              </div>
              <Button onClick={() => { setCurrentClient({}); setIsEditing(true) }}>
                <Plus className="mr-2 h-4 w-4" /> Add Client
              </Button>
            </div>

            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search clients..."
                  className="w-full pl-8 p-2 border rounded-md"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="p-2 border rounded-md bg-background"
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
              >
                <option value="totalSpent">Highest Value</option>
                <option value="lastActive">Recently Active</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            {filteredClients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map(client => {
                  const stats = getClientStats(client.id)
                  return (
                    <motion.div
                      layoutId={`client-${client.id}`}
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className="cursor-pointer group"
                    >
                      <Card className="hover:border-primary/50 transition-all hover:shadow-md">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                              {client.name.charAt(0)}
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setCurrentClient(client); setIsEditing(true) }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  if (confirm(`Are you sure you want to delete ${client.name}?`)) {
                                    const updated = clients.filter(c => c.id !== client.id)
                                    await window.ipcRenderer.invoke('db:save-clients', updated)
                                    setClients(updated)
                                    if (selectedClient?.id === client.id) setSelectedClient(null)
                                    toast({ title: 'Client Deleted', description: `${client.name} has been removed.` })
                                  }
                                }}
                                title="Delete Client"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <h3 className="font-bold text-lg mb-1 truncate">{client.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4 truncate">{client.email || 'No email'}</p>

                          <div className="grid grid-cols-2 gap-2 text-sm pt-4 border-t">
                            <div>
                              <p className="text-muted-foreground text-xs">LTV</p>
                              <p className="font-semibold text-green-600">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalSpent)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-muted-foreground text-xs">Invoices</p>
                              <p className="font-semibold">{stats.invoiceCount}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="py-12">
                  <EmptyClientState
                    onAddClient={() => { setCurrentClient({}); setIsEditing(true) }}
                  />
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6 h-full flex flex-col"
          >
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setSelectedClient(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <h2 className="text-2xl font-bold tracking-tight">{selectedClient.name}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* Profile Card */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClient.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClient.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p>{selectedClient.address?.street}</p>
                      <p>{selectedClient.address?.city}, {selectedClient.address?.state} {selectedClient.address?.zip}</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline" onClick={() => { setCurrentClient(selectedClient); setIsEditing(true) }}>
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {/* CRM Stats & History */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Lifetime Value</p>
                      <p className="text-2xl font-bold text-green-600">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(getClientStats(selectedClient.id).totalSpent)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Total Invoices</p>
                      <p className="text-2xl font-bold">{getClientStats(selectedClient.id).invoiceCount}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Last Active</p>
                      <p className="text-xl font-semibold">
                        {getClientStats(selectedClient.id).lastActive ? format(new Date(getClientStats(selectedClient.id).lastActive!), 'MMM dd, yyyy') : 'Never'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs */}
                <div className="space-y-4">
                  <div className="flex gap-4 border-b">
                    <button className="px-4 py-2 border-b-2 border-blue-500 font-medium text-blue-600">Invoices</button>
                    <button className="px-4 py-2 text-muted-foreground hover:text-foreground">Projects</button>
                    <button className="px-4 py-2 text-muted-foreground hover:text-foreground">Notes</button>
                  </div>

                  {/* Invoice List (Existing) */}
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle>Invoice History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {invoices
                          .filter(inv => inv.clientId === selectedClient.id || inv.clientId === selectedClient.name)
                          .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                          .map(inv => (
                            <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                              <div className="flex items-center gap-3">
                                <div className={`h-2 w-2 rounded-full ${inv.status === 'paid' ? 'bg-green-500' : 'bg-orange-500'}`} />
                                <div>
                                  <p className="font-medium">#{inv.invoiceNumber}</p>
                                  <p className="text-xs text-muted-foreground">{format(new Date(inv.issueDate), 'MMM dd, yyyy')}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">
                                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: inv.currency }).format(inv.total)}
                                </p>
                                <p className="text-xs uppercase font-medium text-muted-foreground">{inv.status}</p>
                              </div>
                            </div>
                          ))}
                        {invoices.filter(inv => inv.clientId === selectedClient.id || inv.clientId === selectedClient.name).length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">No invoices found</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Notes Area */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Client Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        className="w-full h-32 p-3 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Add private notes about this client (preferences, meeting notes, etc)..."
                      />
                      <div className="flex justify-end mt-2">
                        <Button size="sm">Save Notes</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit/Create Modal Overlay */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{currentClient.id ? 'Edit Client' : 'New Client'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  className="w-full p-2 border rounded-md"
                  value={currentClient.name || ''}
                  onChange={(e) => setCurrentClient({ ...currentClient, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    className="w-full p-2 border rounded-md"
                    value={currentClient.email || ''}
                    onChange={(e) => setCurrentClient({ ...currentClient, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <input
                    className="w-full p-2 border rounded-md"
                    value={currentClient.phone || ''}
                    onChange={(e) => setCurrentClient({ ...currentClient, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <input
                  className="w-full p-2 border rounded-md mb-2"
                  placeholder="Street"
                  value={currentClient.address?.street || ''}
                  onChange={(e) => {
                    const base = currentClient.address || { street: '', city: '', state: '', zip: '', country: '' };
                    setCurrentClient({
                      ...currentClient,
                      address: { ...base, street: e.target.value }
                    });
                  }}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="w-full p-2 border rounded-md"
                    placeholder="City"
                    value={currentClient.address?.city || ''}
                    onChange={(e) => {
                      const base = currentClient.address || { street: '', city: '', state: '', zip: '', country: '' };
                      setCurrentClient({
                        ...currentClient,
                        address: { ...base, city: e.target.value }
                      });
                    }}
                  />
                  <input
                    className="w-full p-2 border rounded-md"
                    placeholder="State"
                    value={currentClient.address?.state || ''}
                    onChange={(e) => {
                      const base = currentClient.address || { street: '', city: '', state: '', zip: '', country: '' };
                      setCurrentClient({
                        ...currentClient,
                        address: { ...base, state: e.target.value }
                      });
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
