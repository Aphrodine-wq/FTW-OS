import { create } from 'zustand'
import { Template } from '@/types/invoice'

interface TemplateStore {
  activeTemplateId: string
  templates: Template[]
  customization: {
    primaryColor: string
    fontFamily: string
    layout: 'standard' | 'compact' | 'bold'
  }
  setActiveTemplate: (id: string) => void
  updateCustomization: (updates: Partial<TemplateStore['customization']>) => void
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  activeTemplateId: 'executive',
  templates: [
    {
      id: 'executive',
      name: 'Executive',
      description: 'Traditional, professional, and reliable.',
      type: 'built-in',
      config: {
        colors: { primary: '#1e293b', secondary: '#64748b', accent: '#0f172a' },
        fonts: { heading: 'Inter', body: 'Inter' },
        layout: { headerPosition: 'top', logoPosition: 'left', showLogo: true, showBusinessInfo: true, showClientInfo: true }
      }
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Bold colors and modern typography.',
      type: 'built-in',
      config: {
        colors: { primary: '#6366f1', secondary: '#818cf8', accent: '#4f46e5' },
        fonts: { heading: 'Poppins', body: 'Inter' },
        layout: { headerPosition: 'side', logoPosition: 'right', showLogo: true, showBusinessInfo: true, showClientInfo: true }
      }
    },
    {
      id: 'minimalist',
      name: 'Minimalist',
      description: 'Clean whitespace and sharp lines.',
      type: 'built-in',
      config: {
        colors: { primary: '#000000', secondary: '#666666', accent: '#333333' },
        fonts: { heading: 'Space Mono', body: 'Inter' },
        layout: { headerPosition: 'top', logoPosition: 'center', showLogo: true, showBusinessInfo: true, showClientInfo: true }
      }
    }
  ],
  customization: {
    primaryColor: '#1e293b',
    fontFamily: 'Inter',
    layout: 'standard'
  },
  setActiveTemplate: (id) => set({ activeTemplateId: id }),
  updateCustomization: (updates) => set((state) => ({ 
    customization: { ...state.customization, ...updates } 
  }))
}))
