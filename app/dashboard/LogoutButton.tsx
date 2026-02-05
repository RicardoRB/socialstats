'use client'

import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'
import {createBrowserSupabaseClient} from "@/lib/supabase/browser";

export default function LogoutButton() {
    const supabase = createBrowserSupabaseClient()
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <Button variant="outline" onClick={handleLogout}>
            Cerrar Sesión
        </Button>
    )
}
