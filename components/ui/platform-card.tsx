import * as React from "react"
import {InstagramIcon, LinkIcon, UnlinkIcon, YoutubeIcon} from "lucide-react"

import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge"
import {cn} from "@/lib/utils"
import {XIcon} from "@/components/icons"

interface PlatformCardProps extends React.ComponentProps<typeof Card> {
    provider: "youtube" | "x" | "instagram"
    handle?: string
    avatarUrl?: string
    isConnected: boolean
    onConnect?: () => void
    onDisconnect?: () => void
    lastSync?: string
}

function PlatformCard({
                          provider,
                          handle,
                          avatarUrl,
                          isConnected,
                          onConnect,
                          onDisconnect,
                          lastSync,
                          className,
                          ...props
                      }: PlatformCardProps) {
    const ProviderIcon = provider === "youtube" ? YoutubeIcon : (provider === "instagram" ? InstagramIcon : XIcon)
    const providerName = provider === "youtube" ? "YouTube" : (provider === "instagram" ? "Instagram" : "X (Twitter)")

    return (
        <Card className={cn("w-full max-w-sm", className)} {...props}>
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div
                    className={cn(
                        "rounded-full p-2",
                        provider === "youtube"
                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            : provider === "instagram"
                                ? "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
                                : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    )}
                >
                    <ProviderIcon className="size-6"/>
                </div>
                <div className="flex flex-col">
                    <h3 className="font-semibold">{providerName}</h3>
                    <Badge
                        variant={isConnected ? "default" : "secondary"}
                        className="w-fit"
                    >
                        {isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                {isConnected ? (
                    <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                            <AvatarImage src={avatarUrl} alt={handle}/>
                            <AvatarFallback>
                                {handle?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{handle}</span>
                            {lastSync && (
                                <span className="text-muted-foreground text-xs">
                  Last sync: {lastSync}
                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm">
                        Connect your {providerName} account to track your stats.
                    </p>
                )}
            </CardContent>
            <CardFooter>
                {isConnected ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={onDisconnect}
                    >
                        <UnlinkIcon className="size-4"/> Disconnect
                    </Button>
                ) : (
                    <Button size="sm" className="w-full gap-2" onClick={onConnect}>
                        <LinkIcon className="size-4"/> Connect
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}

export {PlatformCard}
