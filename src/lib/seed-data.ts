import { Invoice, Client, ProjectUpdate, Task, Lead } from '@/types/invoice'
import { addDays, subDays } from 'date-fns'

// Feature flag to enable/disable seed data
// Set to false for production to start with empty state
export const ENABLE_SEED_DATA = false // Disabled for production

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

// Seed data injection disabled - removed for production
export async function injectSeedData() {
  // Feature disabled - no seed data will be injected
  return
}
