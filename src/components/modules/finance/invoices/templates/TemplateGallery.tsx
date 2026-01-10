import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTemplateStore } from '@/stores/template-store'
import { TEMPLATES } from '@/stores/template-registry'
import { Check, Palette, Type, Layout, Badge } from 'lucide-react'

export function TemplateGallery() {
  const { activeTemplateId, setActiveTemplate, customization, updateCustomization } = useTemplateStore()

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Template Universe</h2>
        <p className="text-muted-foreground text-lg">Choose from our professionally curated invoice designs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TEMPLATES.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              activeTemplateId === template.id ? 'border-primary ring-2 ring-primary/20 shadow-lg scale-[1.02]' : 'hover:border-primary/50'
            }`}
            onClick={() => setActiveTemplate(template.id)}
          >
            <CardContent className="p-4 pt-6">
              <div className="aspect-[3/4] rounded-lg mb-4 relative overflow-hidden group shadow-inner border" style={{ backgroundColor: template.colors.background }}>
                {/* Visual Representation */}
                <div className={`w-full h-full p-4 flex flex-col ${
                  template.style === 'minimalist' ? 'items-center justify-center' : 
                  template.style === 'creative' ? 'items-end' : 'items-start'
                }`}>
                  <div className="w-full h-8 mb-4 rounded opacity-20" style={{ backgroundColor: template.colors.primary }} />
                  <div className="w-1/2 h-4 mb-2 rounded opacity-10" style={{ backgroundColor: template.colors.secondary }} />
                  <div className="w-full h-full space-y-2 mt-4 opacity-50">
                    <div className="w-full h-2 rounded bg-slate-200" />
                    <div className="w-full h-2 rounded bg-slate-200" />
                    <div className="w-2/3 h-2 rounded bg-slate-200" />
                  </div>
                </div>

                {activeTemplateId === template.id && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg animate-in zoom-in">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-end h-1/3">
                   <span className="text-white font-medium text-sm">Preview</span>
                </div>
              </div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base">{template.name}</h3>
                  <p className="text-xs text-muted-foreground">{template.category}</p>
                </div>
                {template.style === 'tech' && <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded">DARK</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold mb-6">Advanced Customization</h3>
        <p className="text-sm text-muted-foreground mb-6">Override template defaults with your brand settings.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Color Customizer */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Palette className="h-4 w-4" /> Brand Color
            </div>
            <div className="flex flex-wrap gap-2">
              {['#1e293b', '#6366f1', '#000000', '#dc2626', '#16a34a', '#d97706'].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    customization.primaryColor === color ? 'border-primary' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => updateCustomization({ primaryColor: color })}
                />
              ))}
              <input
                type="color"
                value={customization.primaryColor}
                onChange={(e) => updateCustomization({ primaryColor: e.target.value })}
                className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer"
              />
            </div>
          </div>
          {/* ... Fonts ... */}
        </div>
      </div>
    </div>
  )
}

