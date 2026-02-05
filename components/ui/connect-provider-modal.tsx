"use client"

import * as React from "react"
import {InstagramIcon, YoutubeIcon} from "lucide-react"

import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {XIcon} from "@/components/icons"

interface ConnectProviderModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (provider: "youtube" | "x" | "instagram") => void
}

function ConnectProviderModal({
                                  open,
                                  onOpenChange,
                                  onSelect,
                              }: ConnectProviderModalProps) {
    const providers = [
        {
            id: "youtube",
            name: "YouTube",
            icon: YoutubeIcon,
            color: "text-red-600",
            description: "Sync your channel views and subscriber count.",
        },
        {
            id: "x",
            name: "X (Twitter)",
            icon: XIcon,
            color: "text-zinc-900 dark:text-zinc-100",
            description: "Track your impressions and engagement.",
        },
        {
            id: "instagram",
            name: "Instagram",
            icon: InstagramIcon,
            color: "text-pink-600",
            description: "Track your reach and followers.",
        },
    ] as const

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Connect Social Account</DialogTitle>
                    <DialogDescription>
                        Choose a platform to connect and start tracking your metrics.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {providers.map((p) => (
                        <Button
                            key={p.id}
                            variant="outline"
                            className="flex h-auto items-center justify-start gap-4 p-4 text-left"
                            onClick={() => onSelect(p.id)}
                        >
                            <p.icon className={`size-8 shrink-0 ${p.color}`}/>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-semibold">{p.name}</span>
                                <span className="text-muted-foreground text-xs font-normal line-clamp-1">
                  {p.description}
                </span>
                            </div>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export {ConnectProviderModal}
