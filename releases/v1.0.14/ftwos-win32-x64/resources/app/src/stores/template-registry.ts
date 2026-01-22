export interface TemplateConfig {
  id: string
  name: string
  category: 'Corporate' | 'Creative' | 'Industry' | 'Legal'
  style: 'corporate' | 'creative' | 'minimalist' | 'tech' | 'classic'
  colors: { primary: string, secondary: string, background: string, text: string }
  fonts: { header: string, body: string }
}

export const TEMPLATES: TemplateConfig[] = [
  // Corporate
  { id: 'fortune500', name: 'Fortune 500', category: 'Corporate', style: 'corporate', colors: { primary: '#0f172a', secondary: '#cbd5e1', background: '#ffffff', text: '#1e293b' }, fonts: { header: 'Inter', body: 'Inter' } },
  { id: 'consultant', name: 'Pro Consultant', category: 'Corporate', style: 'corporate', colors: { primary: '#2563eb', secondary: '#bfdbfe', background: '#f8fafc', text: '#1e293b' }, fonts: { header: 'Inter', body: 'Roboto' } },
  { id: 'legal', name: 'Legal Standard', category: 'Corporate', style: 'classic', colors: { primary: '#475569', secondary: '#e2e8f0', background: '#ffffff', text: '#334155' }, fonts: { header: 'Playfair Display', body: 'Merriweather' } },
  { id: 'finance', name: 'Wall Street', category: 'Corporate', style: 'corporate', colors: { primary: '#047857', secondary: '#d1fae5', background: '#ffffff', text: '#064e3b' }, fonts: { header: 'Inter', body: 'Inter' } },

  // Creative
  { id: 'vibrant', name: 'Vibrant Studio', category: 'Creative', style: 'creative', colors: { primary: '#db2777', secondary: '#fbcfe8', background: '#fff1f2', text: '#831843' }, fonts: { header: 'Poppins', body: 'Inter' } },
  { id: 'darkmode', name: 'Midnight UI', category: 'Creative', style: 'tech', colors: { primary: '#10b981', secondary: '#064e3b', background: '#0f172a', text: '#f8fafc' }, fonts: { header: 'JetBrains Mono', body: 'Inter' } },
  { id: 'portfolio', name: 'Portfolio Clean', category: 'Creative', style: 'minimalist', colors: { primary: '#000000', secondary: '#e5e5e5', background: '#ffffff', text: '#000000' }, fonts: { header: 'Inter', body: 'Inter' } },
  { id: 'bold', name: 'Bold Agency', category: 'Creative', style: 'creative', colors: { primary: '#7c3aed', secondary: '#ddd6fe', background: '#ffffff', text: '#4c1d95' }, fonts: { header: 'Montserrat', body: 'Open Sans' } },

  // Industry
  { id: 'construction', name: 'Build & Construct', category: 'Industry', style: 'corporate', colors: { primary: '#ea580c', secondary: '#ffedd5', background: '#fff7ed', text: '#7c2d12' }, fonts: { header: 'Oswald', body: 'Roboto' } },
  { id: 'medical', name: 'MediCare', category: 'Industry', style: 'corporate', colors: { primary: '#0ea5e9', secondary: '#e0f2fe', background: '#ffffff', text: '#0c4a6e' }, fonts: { header: 'Inter', body: 'Inter' } },
  { id: 'tech', name: 'SaaS Platform', category: 'Industry', style: 'tech', colors: { primary: '#6366f1', secondary: '#e0e7ff', background: '#1e1b4b', text: '#e0e7ff' }, fonts: { header: 'Inter', body: 'Inter' } },
  { id: 'food', name: 'Culinary', category: 'Industry', style: 'classic', colors: { primary: '#991b1b', secondary: '#fee2e2', background: '#fffcf5', text: '#450a0a' }, fonts: { header: 'Playfair Display', body: 'Lato' } },

  // Documents
  { id: 'nda', name: 'Standard NDA', category: 'Legal', style: 'classic', colors: { primary: '#000000', secondary: '#e5e5e5', background: '#ffffff', text: '#000000' }, fonts: { header: 'Times New Roman', body: 'Times New Roman' } },
  { id: 'contract', name: 'Service Agreement', category: 'Legal', style: 'corporate', colors: { primary: '#334155', secondary: '#f1f5f9', background: '#ffffff', text: '#0f172a' }, fonts: { header: 'Inter', body: 'Inter' } },
]
