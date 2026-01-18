import { Invoice, Client, ProjectUpdate, Task, Lead } from '@/types/invoice'
import { addDays, subDays } from 'date-fns'

// Feature flag to enable/disable seed data
// Set to false for production to start with empty state
export const ENABLE_SEED_DATA = true // TODO: Set to false for production

const CLIENTS: Client[] = [
  { id: 'c1', name: 'Acme Corp', email: 'billing@acme.com', address: { street: '123 Tech Blvd', city: 'San Francisco', state: 'CA', zip: '94105', country: 'USA' } },
  { id: 'c2', name: 'Globex Inc', email: 'accounts@globex.com', address: { street: '456 Global Way', city: 'New York', state: 'NY', zip: '10001', country: 'USA' } },
  { id: 'c3', name: 'Soylent Corp', email: 'food@soylent.com', address: { street: '789 Future Dr', city: 'Austin', state: 'TX', zip: '78701', country: 'USA' } },
  { id: 'c4', name: 'Stark Industries', email: 'tony@stark.com', address: { street: '10880 Malibu Point', city: 'Malibu', state: 'CA', zip: '90265', country: 'USA' } },
  { id: 'c5', name: 'Wayne Enterprises', email: 'bruce@wayne.com', address: { street: '1007 Mountain Dr', city: 'Gotham', state: 'NJ', zip: '07001', country: 'USA' } },
  { id: 'c6', name: 'Cyberdyne Systems', email: 'skynet@cyberdyne.com', address: { street: '18144 El Camino Real', city: 'Sunnyvale', state: 'CA', zip: '94086', country: 'USA' } },
  { id: 'c7', name: 'Massive Dynamic', email: 'bell@massive.com', address: { street: '650 Fifth Avenue', city: 'New York', state: 'NY', zip: '10019', country: 'USA' } },
  { id: 'c8', name: 'Hooli', email: 'gavin@hooli.com', address: { street: '5230 Penfield Ave', city: 'Palo Alto', state: 'CA', zip: '94306', country: 'USA' } },
]

const LEADS: Lead[] = [
  { id: 'l1', name: 'Initech', email: 'peter@initech.com', status: 'prospect', value: 15000, source: 'LinkedIn', notes: 'Interested in TPS reports automation', createdAt: new Date() },
  { id: 'l2', name: 'Umbrella Corp', email: 'wesker@umbrella.com', status: 'contacted', value: 50000, source: 'Referral', notes: 'Need bio-security software', createdAt: new Date() },
  { id: 'l3', name: 'Aperture Science', email: 'glados@aperture.com', status: 'proposal', value: 75000, source: 'Website', notes: 'Testing framework needed', createdAt: new Date() },
  { id: 'l4', name: 'Black Mesa', email: 'gordon@blackmesa.com', status: 'won', value: 12000, source: 'Conference', notes: 'Physics simulation engine', createdAt: new Date() },
]

export async function injectSeedData() {
  // Check feature flag first
  if (!ENABLE_SEED_DATA) {
    console.log('Seed data disabled via feature flag')
    return
  }

  // Safety check: ensure ipcRenderer is available
  if (!window.ipcRenderer) {
    console.warn('IPC renderer not available, skipping seed data injection')
    return
  }

  try {
    const existingClients = await window.ipcRenderer.invoke('db:get-clients')
    if (existingClients && existingClients.length > 0) return // Already seeded
  } catch (error) {
    console.warn('Could not check existing data, skipping seed data injection:', error)
    return
  }

  console.log("Injecting massive seed data...")

  // Generate 50 Invoices
  const invoices: Invoice[] = []
  for (let i = 0; i < 50; i++) {
    const client = CLIENTS[i % CLIENTS.length]
    const status = Math.random() > 0.7 ? 'paid' : Math.random() > 0.5 ? 'sent' : Math.random() > 0.3 ? 'overdue' : 'draft'
    const total = Math.floor(Math.random() * 8000) + 500
    
    invoices.push({
      id: `inv-${i}`,
      invoiceNumber: `INV-2024-${1000+i}`,
      clientId: client.name, // Using name for simplicity in this legacy schema
      issueDate: subDays(new Date(), i * 3),
      dueDate: addDays(new Date(), 30 - (i * 3)),
      status: status as any,
      total,
      subtotal: total,
      tax: 0,
      currency: 'USD',
      lineItems: [
        { id: `li-${i}`, description: 'Professional Services', quantity: 1, rate: total, amount: total }
      ],
      notes: 'Thank you for your business.',
      taxes: []
    })
  }

  // Generate Tasks
  const tasks: Task[] = []
  for (let i = 0; i < 30; i++) {
    tasks.push({
      id: `t-${i}`,
      title: `Task ${i}: ${['Update API', 'Fix CSS', 'Client Meeting', 'Database Migration', 'Unit Tests'][i % 5]}`,
      status: Math.random() > 0.5 ? 'done' : Math.random() > 0.5 ? 'in_progress' : 'todo',
      projectId: CLIENTS[i % CLIENTS.length].id,
      createdAt: new Date()
    })
  }

  try {
    await window.ipcRenderer.invoke('db:save-clients', CLIENTS)
    await window.ipcRenderer.invoke('db:save-invoices', invoices)
    await window.ipcRenderer.invoke('db:save-leads', LEADS)
    await window.ipcRenderer.invoke('db:save-tasks', tasks)

    console.log("Seed data injected.")
  } catch (error) {
    console.error('Failed to inject seed data:', error)
  }
}
