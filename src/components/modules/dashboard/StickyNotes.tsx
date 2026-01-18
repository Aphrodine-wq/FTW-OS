import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, X, Save } from 'lucide-react'
import { cn } from '@/services/utils'

export function StickyNotes() {
  const [note, setNote] = useState('TODO:\n- Review PR #102\n- Call Mom\n- Buy Milk')
  const [color, setColor] = useState('bg-yellow-100')

  return (
    <Card className={cn("h-full flex flex-col transition-colors", color)}>
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-700">Quick Notes</CardTitle>
            <div className="flex gap-1">
                <button onClick={() => setColor('bg-yellow-100')} className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500 hover:scale-110 transition-transform" />
                <button onClick={() => setColor('bg-blue-100')} className="w-3 h-3 rounded-full bg-blue-400 border border-blue-500 hover:scale-110 transition-transform" />
                <button onClick={() => setColor('bg-green-100')} className="w-3 h-3 rounded-full bg-green-400 border border-green-500 hover:scale-110 transition-transform" />
                <button onClick={() => setColor('bg-pink-100')} className="w-3 h-3 rounded-full bg-pink-400 border border-pink-500 hover:scale-110 transition-transform" />
            </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
            <textarea 
                className="w-full h-full resize-none bg-transparent border-none p-4 pt-0 focus:ring-0 text-slate-700 font-medium text-sm leading-relaxed"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Type something..."
            />
        </CardContent>
    </Card>
  )
}
