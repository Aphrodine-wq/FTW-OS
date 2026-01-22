import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Edit3, Plus, MoreVertical, CheckCircle2, Mail
} from 'lucide-react'
import { cn } from '@/services/utils'

const NEWSLETTERS = [
    { id: 1, subject: 'Jan Update: FTWOS v2 is here', status: 'Draft', sent: '-', openRate: '-' },
    { id: 2, subject: '5 Tips for Freelance Developers', status: 'Sent', sent: 'Jan 10, 2026', openRate: '42%' },
    { id: 3, subject: 'Weekly Roundup #42', status: 'Sent', sent: 'Jan 03, 2026', openRate: '38%' },
]

export function NewsletterStudio() {
    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Newsletter Studio</h2>
                    <p className="text-muted-foreground">Manage your lists and broadcast updates</p>
                </div>
                <div className="flex gap-2">
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-4 w-4" /> New Campaign
                    </Button>
                </div>
            </div>

            {/* Integration Buttons */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Mail className="h-5 w-5" />
                        <h3 className="font-semibold">Email Platform Integrations</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            variant="outline"
                            className="h-20 flex-col gap-2 hover:border-yellow-500"
                            onClick={() => window.open('https://mailchimp.com', '_blank')}
                        >
                            <div className="h-10 w-10 rounded bg-yellow-400 flex items-center justify-center text-white font-bold text-lg">
                                MC
                            </div>
                            <span className="text-sm font-medium">Connect Mailchimp</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex-col gap-2 hover:border-blue-500"
                            onClick={() => window.open('https://sendgrid.com', '_blank')}
                        >
                            <div className="h-10 w-10 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                SG
                            </div>
                            <span className="text-sm font-medium">Connect SendGrid</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex-col gap-2 hover:border-pink-500"
                            onClick={() => window.open('https://convertkit.com', '_blank')}
                        >
                            <div className="h-10 w-10 rounded bg-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                CK
                            </div>
                            <span className="text-sm font-medium">Connect ConvertKit</span>
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                        💡 Configure API keys in <span className="text-blue-600 font-medium">Settings → Integrations</span>
                    </p>
                </CardContent>
            </Card>

            {/* Campaigns List */}
            <div className="grid grid-cols-1 gap-4">
                {NEWSLETTERS.map(n => (
                    <Card key={n.id} className="group hover:border-indigo-500 transition-colors cursor-pointer">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-full flex items-center justify-center",
                                    n.status === 'Draft' ? "bg-slate-100 text-slate-500 dark:bg-slate-800" : "bg-green-100 text-green-600 dark:bg-green-900/30"
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
                                <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-5 w-5 text-slate-400" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
