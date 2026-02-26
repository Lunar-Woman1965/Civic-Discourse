
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import AdminDashboard from '@/components/admin-dashboard'

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#8B7355] via-[#D4C5B0] to-[#6B8E23]">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-2xl max-w-md text-center">
          <h1 className="text-2xl font-bold text-[#2C1810] mb-4">Access Denied</h1>
          <p className="text-gray-700 mb-6">
            You do not have permission to access the admin dashboard.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-[#6B8E23] text-white rounded-md hover:bg-[#5a7a1e] transition"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}
