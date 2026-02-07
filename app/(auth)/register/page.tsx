'use client'

import React, {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import Link from 'next/link'
import {toast} from 'sonner'
import {createBrowserSupabaseClient} from "@/lib/supabase/browser";

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createBrowserSupabaseClient();

    const handleRegister = async (e: React.ChangeEvent) => {
        e.preventDefault()
        setLoading(true)

        const {error} = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            toast.error(error.message)
            setLoading(false)
        } else {
            toast.success('Registro exitoso. Revisa tu email para confirmar.')
            router.push('/login')
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Registro</CardTitle>
                    <CardDescription>Crea una nueva cuenta para empezar</CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </Button>
                        <div className="text-xs text-center text-muted-foreground space-y-2">
                            <p>
                                Al registrarte, aceptas nuestros{' '}
                                <Link href="/tos" className="underline hover:text-primary">Términos de Servicio</Link> y nuestra{' '}
                                <Link href="/privacy-policy" className="underline hover:text-primary">Política de Privacidad</Link>.
                            </p>
                            <div>
                                ¿Ya tienes cuenta?{' '}
                                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                                    Inicia sesión
                                </Link>
                            </div>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
