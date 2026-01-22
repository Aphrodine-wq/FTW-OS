import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Mail, Users, Send, Edit3, Plus, 
  MoreVertical, Clock, CheckCircle2, FileText
} from 'lucide-react'
import { cn } from '@/services/utils'

const NEWSLETTERS = [
  { id: 1, subject: 'Jan Update: FTWOS v2 is here', status: 'Draft', sent: '-', openRate: '-' },
  { id: 2, subject: '5 Tips for Freelance Developers', status: 'Sent', sent: 'Jan 10, 2026', openRate: '42%' },
  { id: 3, subject: 'Weekly Roundup #42', status: 'Sent', sent: 'Jan 03, 2026', openRate: '38%' },
]

export function NewsletterStudio() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'subscribers'>('campaigns')

  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Newsletter Studio</h2>
          <p className="text-muted-foreground">Manage your lists and broadcast updates</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab('subscribers')} className={activeTab === 'subscribers' ? 'bg-slate-100' : ''}>
                <Users className="h-4 w-4 mr-2" /> Subscribers
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('campaigns')} className={activeTab === 'campaigns' ? 'bg-slate-100' : ''}>
                <Mail className="h-4 w-4 mr-2" /> Campaigns
            </Button>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4" /> New Campaign
            </Button>
        </div>
      </div>

      {activeTab === 'campaigns' ? (
          <div className="grid grid-cols-1 gap-4">
              {NEWSLETTERS.map(n => (
                  <Card key={n.id} className="group hover:border-indigo-500 transition-colors cursor-pointer">
                      <CardContent className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className={cn(
                                  "h-12 w-12 rounded-full flex items-center justify-center",
                                  n.status === 'Draft' ? "bg-slate-100 text-slate-500" : "bg-green-100 text-green-600"
                              )}>
                                  {n.status === 'Draft' ? <Edit3 className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                              </div>
                              <div>
                                  <h3 className="font-bold text-lg">{n.subject}</h3>
                                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                                      {n.status === 'Draft' ? 'Last edited 2 hours ago' : `Sent on ${n.sent}`}
                                  </p>
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-8">
                              <div className="text-center">
                                  <div className="text-2xl font-bold">{n.openRate}</div>
                                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Open Rate</div>
                              </div>
                              <div className="h-10 w-px bg-slate-200" />
                              <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-5 w-5 text-slate-400" />
                              </Button>
                          </div>
                      </CardContent>
                  </Card>
              ))}
          </div>
      ) : (
          <Card>
              <CardContent className="p-0">
                  <div className="p-8 text-center text-slate-500">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <h3 className="text-lg font-medium">Subscriber Management</h3>
                      <p>List import and segmentation coming soon.</p>
                  </div>
              </CardContent>
          </Card>
      )}
    </div>
  )
}
