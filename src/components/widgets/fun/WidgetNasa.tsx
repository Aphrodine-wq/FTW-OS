import React, { useState, useEffect } from 'react'
import { AppWidget } from '@/components/modules/core/dashboard/widgets/AppWidget'
import { Telescope } from 'lucide-react'
import { cn } from '@/services/utils'

export function WidgetNasa({ id, onRemove }: { id?: string, onRemove?: () => void }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Use a demo key or a public proxy if possible, or just mock it for now to be safe/fast
        // We'll mock it for reliability in this demo context
        setTimeout(() => {
            setData({
                title: "The Pillars of Creation",
                url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
                explanation: "Three towers of gas and dust, standing light-years tall, are giving birth to new stars, buried deep inside their dark clouds."
            })
            setLoading(false)
        }, 1000)
    }, [])

    return (
        <AppWidget title="Cosmic View" icon={Telescope} id={id || 'nasa'} onRemove={onRemove}>
            <div className="h-full w-full relative group overflow-hidden">
                {loading ? (
                    <div className="h-full w-full bg-black/20 animate-pulse" />
                ) : (
                    <>
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${data.url})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <h4 className="font-bold text-sm truncate">{data.title}</h4>
                            <p className="text-[10px] opacity-70 line-clamp-2">{data.explanation}</p>
                        </div>
                    </>
                )}
            </div>
        </AppWidget>
    )
}
