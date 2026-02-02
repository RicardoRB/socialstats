'use client'

import {createClient} from '@/lib/auth'
import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'

export default function LogoutButton() {
    const supabase = createClient()
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
