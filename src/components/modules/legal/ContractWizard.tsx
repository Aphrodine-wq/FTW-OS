import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  FileText, Shield, PenTool, Download, Printer, 
  ChevronRight, CheckCircle2, User, Calendar, DollarSign
} from 'lucide-react'
import { cn } from '@/services/utils'

const TEMPLATES = [
  { id: 'nda', name: 'Non-Disclosure Agreement', desc: 'Standard mutual NDA protection.' },
  { id: 'service', name: 'Master Service Agreement', desc: 'For ongoing freelance work.' },
  { id: 'retainer', name: 'Retainer Agreement', desc: 'Monthly recurring services.' },
]

export function ContractWizard() {
  const [step, setStep] = useState(1)
  const [template, setTemplate] = useState('nda')
  const [formData, setFormData] = useState({
    clientName: '',
    clientAddress: '',
    startDate: '',
    amount: '',
    scope: ''
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contract Wizard</h2>
          <p className="text-muted-foreground">Generate legally binding agreements in minutes</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" /> Print / PDF
            </Button>
            <Button className="bg-slate-900 text-white">
                <Download className="h-4 w-4 mr-2" /> Save
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Config */}
        <Card className="print:hidden h-fit">
            <CardContent className="p-6 space-y-6">
                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-6">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                                step >= s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                            )}>
                                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                            </div>
                            <span className="text-xs font-medium text-slate-500">
                                {s === 1 ? 'Template' : s === 2 ? 'Details' : 'Review'}
                            </span>
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="space-y-3">
                        <h3 className="font-medium">Select Template</h3>
                        {TEMPLATES.map(t => (
                            <div 
                                key={t.id}
                                onClick={() => setTemplate(t.id)}
                                className={cn(
                                    "p-3 rounded-lg border cursor-pointer transition-all hover:border-slate-400",
                                    template === t.id ? "bg-slate-50 border-slate-900 ring-1 ring-slate-900" : "bg-white"
                                )}
                            >
                                <div className="font-bold text-sm">{t.name}</div>
                                <div className="text-xs text-muted-foreground">{t.desc}</div>
                            </div>
                        ))}
                        <Button className="w-full mt-4" onClick={() => setStep(2)}>
                            Next Step <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <h3 className="font-medium">Contract Details</h3>
                        <div className="space-y-2">
                            <label className="text-xs font-medium">Client Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input className="pl-9" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} placeholder="Acme Corp" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium">Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input className="pl-9" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                            </div>
                        </div>
                        {template !== 'nda' && (
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Contract Value</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input className="pl-9" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="5000" />
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2 mt-4">
                            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                            <Button className="flex-1" onClick={() => setStep(3)}>Preview</Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5" />
                            Ready to export!
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setStep(2)}>Edit Details</Button>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Live Preview */}
        <div className="lg:col-span-2 bg-white shadow-lg border rounded-none lg:rounded-lg min-h-[800px] p-12 print:p-0 print:shadow-none print:border-none print:w-full">
            <div className="max-w-2xl mx-auto space-y-8 font-serif">
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-3xl font-bold uppercase tracking-widest border-b-2 border-black pb-4">
                        {TEMPLATES.find(t => t.id === template)?.name}
                    </h1>
                    <p className="text-sm text-slate-500">Document Reference: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>

                <div className="space-y-6 text-justify leading-relaxed">
                    <p>
                        This Agreement is entered into as of <strong>{formData.startDate || '[DATE]'}</strong>, by and between <strong>{formData.clientName || '[CLIENT NAME]'}</strong> ("Client") and <strong>FTW Systems</strong> ("Provider").
                    </p>

                    <h3 className="font-bold text-lg uppercase mt-8">1. Services</h3>
                    <p>
                        Provider agrees to perform the services described in the attached Statement of Work. All services shall be performed in a professional manner.
                    </p>

                    <h3 className="font-bold text-lg uppercase mt-8">2. Compensation</h3>
                    <p>
                        Client agrees to pay Provider a total of <strong>${formData.amount || '0.00'}</strong> for the services rendered. Payment terms are Net-30 unless otherwise specified.
                    </p>

                    <h3 className="font-bold text-lg uppercase mt-8">3. Confidentiality</h3>
                    <p>
                        Both parties agree to keep all proprietary information confidential. This includes but is not limited to trade secrets, customer lists, and technical data.
                    </p>
                    
                    <h3 className="font-bold text-lg uppercase mt-8">4. Term & Termination</h3>
                    <p>
                        This agreement shall remain in effect until the completion of services or until terminated by either party with 30 days written notice.
                    </p>
                </div>

                <div className="mt-24 grid grid-cols-2 gap-12">
                    <div className="space-y-2">
                        <div className="h-24 border-b border-black flex items-end pb-2 font-handwriting text-2xl text-blue-600">
                           {/* Digital Signature Placeholder */}
                        </div>
                        <p className="font-bold uppercase text-xs tracking-wider">Signed by Provider</p>
                        <p className="text-sm">Walt, FTW Systems</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-24 border-b border-black flex items-end pb-2">
                            {/* Client Signature Area */}
                        </div>
                        <p className="font-bold uppercase text-xs tracking-wider">Signed by Client</p>
                        <p className="text-sm">{formData.clientName || '[Client Representative]'}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
