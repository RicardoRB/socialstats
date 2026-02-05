"use client"

import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Instagram, Twitter, Youtube} from "lucide-react"
import {TikTokIcon} from "@/components/icons"

interface ConnectProviderModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ConnectProviderModal({open, onOpenChange}: ConnectProviderModalProps) {
    const providers = [
        {
            id: 'youtube',
            name: 'YouTube',
            icon: Youtube,
            color: 'hover:bg-red-50 hover:text-red-600 hover:border-red-200'
        },
        {
            id: 'x',
            name: 'X (Twitter)',
            icon: Twitter,
            color: 'hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200'
        },
        {
            id: 'instagram',
            name: 'Instagram',
            icon: Instagram,
            color: 'hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200'
        },
        {
            id: 'tiktok',
            name: 'TikTok',
            icon: TikTokIcon,
            color: 'hover:bg-slate-900 hover:text-white hover:border-slate-800'
        },
    ]

    const connect = (providerId: string) => {
        window.location.href = `/api/auth/${providerId}/start`
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Conectar plataforma</DialogTitle>
                    <DialogDescription>
                        Selecciona una plataforma para sincronizar tus métricas.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {providers.map((p) => (
                        <Button
                            key={p.id}
                            variant="outline"
                            className={`flex items-center justify-start gap-3 h-12 px-4 transition-colors ${p.color}`}
                            onClick={() => connect(p.id)}
                        >
                            <p.icon className="h-5 w-5"/>
                            <span>Conectar {p.name}</span>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
