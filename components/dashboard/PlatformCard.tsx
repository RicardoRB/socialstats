"use client"

import {useState} from "react"
import {Card, CardContent, CardFooter} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Instagram, RefreshCw, Twitter, Youtube} from "lucide-react"
import {TikTokIcon, XIcon} from "@/components/icons"
import {toast} from "sonner"

interface PlatformCardProps {
    account: {
        id: string
        provider: string
        display_name: string
        avatar_url?: string
        last_synced_at?: string
    }
}

export function PlatformCard({account}: PlatformCardProps) {
    const [syncing, setSyncing] = useState(false)

    const handleSync = async () => {
        setSyncing(true)
        try {
            const res = await fetch(`/api/sync/${account.provider}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
            })

            if (!res.ok) throw new Error('Sync failed')

            toast.success(`Sincronización iniciada para ${account.display_name}`)
        } catch (error) {
            toast.error('Error al sincronizar')
        } finally {
            setSyncing(false)
        }
    }

    const ProviderIcon = account.provider === 'youtube' ? Youtube :
        (account.provider === 'instagram' ? Instagram :
            (account.provider === 'tiktok' ? TikTokIcon :
                (account.provider === 'x' ? XIcon : Twitter)))

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border shrink-0">
                        <AvatarImage src={account.avatar_url} alt={account.display_name}/>
                        <AvatarFallback>{account.display_name?.[0] || account.provider?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <ProviderIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0"/>
                            <p className="text-sm font-semibold leading-tight truncate">
                                {account.display_name || 'Sin nombre'}
                            </p>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {account.provider}
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 px-4 py-2 flex justify-between items-center border-t">
        <span className="text-[10px] text-muted-foreground truncate mr-2">
          {account.last_synced_at
              ? `Sinc: ${new Date(account.last_synced_at).toLocaleDateString()}`
              : 'No sincronizado'}
        </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={handleSync}
                    disabled={syncing}
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`}/>
                </Button>
            </CardFooter>
        </Card>
    )
}
