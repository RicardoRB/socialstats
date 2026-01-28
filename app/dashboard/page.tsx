import { requireUser } from '@/lib/auth'
import LogoutButton from './LogoutButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const user = await requireUser()

  return (
    <div className="p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>Bienvenido a tu panel de control</CardDescription>
          </div>
          <LogoutButton />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Has iniciado sesión como:</p>
            <pre className="p-4 bg-slate-100 rounded-md overflow-auto text-xs">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
