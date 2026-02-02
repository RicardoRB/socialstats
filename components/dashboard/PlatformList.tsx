"use client"

import { useState } from "react"
import { PlatformCard } from "./PlatformCard"
import { ConnectProviderModal } from "./ConnectProviderModal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface PlatformListProps {
  accounts: any[]
}

export function PlatformList({ accounts }: PlatformListProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Plataformas conectadas</h2>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Conectar
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/30">
          <p className="text-muted-foreground text-sm mb-4">No tienes plataformas conectadas</p>
          <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
            Conectar mi primera red
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <PlatformCard key={account.id} account={account} />
          ))}
        </div>
      )}

      <ConnectProviderModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
