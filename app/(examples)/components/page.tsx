"use client"

import * as React from "react"
import {EyeIcon, HeartIcon, UsersIcon} from "lucide-react"

import {MetricTile} from "@/components/ui/metric-tile"
import {PlatformCard} from "@/components/ui/platform-card"
import {ConfirmDialog} from "@/components/ui/confirm-dialog"
import {ConnectProviderModal} from "@/components/ui/connect-provider-modal"
import {LineChartWrapper} from "@/components/ui/line-chart-wrapper"
import {Button} from "@/components/ui/button"
import {toast} from "sonner"

const chartData = [
    {date: "2024-01-01", views: 400, likes: 240},
    {date: "2024-01-02", views: 300, likes: 139},
    {date: "2024-01-03", views: 200, likes: 980},
    {date: "2024-01-04", views: 278, likes: 390},
    {date: "2024-01-05", views: 189, likes: 480},
    {date: "2024-01-06", views: 239, likes: 380},
    {date: "2024-01-07", views: 349, likes: 430},
]

export default function ComponentsExamplePage() {
    const [isConnectModalOpen, setIsConnectModalOpen] = React.useState(false)

    const handleConnect = (provider: string) => {
        toast.success(`Connecting to ${provider}...`)
        setIsConnectModalOpen(false)
    }

    const handleDisconnect = () => {
        toast.info("Account disconnected")
    }

    return (
        <div className="container mx-auto py-10 space-y-12">
            <div>
                <h1 className="text-3xl font-bold mb-2">UI Components</h1>
                <p className="text-muted-foreground">
                    Reusable components for the Social Stats dashboard.
                </p>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">MetricTile</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <MetricTile
                        label="Total Views"
                        value="128,430"
                        trend={12.5}
                        icon={<EyeIcon className="size-4"/>}
                    />
                    <MetricTile
                        label="Engagement"
                        value="4,210"
                        trend={-2.4}
                        icon={<HeartIcon className="size-4"/>}
                    />
                    <MetricTile
                        label="Subscribers"
                        value="15,200"
                        trend={0.8}
                        icon={<UsersIcon className="size-4"/>}
                    />
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">PlatformCard</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <PlatformCard
                        provider="youtube"
                        handle="TechChannel"
                        avatarUrl="https://github.com/shadcn.png"
                        isConnected={true}
                        lastSync="2 hours ago"
                        onDisconnect={handleDisconnect}
                    />
                    <PlatformCard
                        provider="x"
                        isConnected={false}
                        onConnect={() => setIsConnectModalOpen(true)}
                    />
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Charts</h2>
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="font-medium mb-4">Performance over time</h3>
                    <LineChartWrapper
                        data={chartData}
                        index="date"
                        categories={["views", "likes"]}
                        className="h-[300px]"
                    />
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Modals & Dialogs</h2>
                <div className="flex flex-wrap gap-4">
                    <Button onClick={() => setIsConnectModalOpen(true)}>
                        Open Connect Modal
                    </Button>

                    <ConfirmDialog
                        title="Are you absolutely sure?"
                        description="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
                        confirmText="Delete Account"
                        variant="destructive"
                        onConfirm={() => toast.error("Account deleted (simulated)")}
                        trigger={<Button variant="destructive">Open Confirm Dialog</Button>}
                    />
                </div>
            </section>

            <ConnectProviderModal
                open={isConnectModalOpen}
                onOpenChange={setIsConnectModalOpen}
                onSelect={handleConnect}
            />
        </div>
    )
}
