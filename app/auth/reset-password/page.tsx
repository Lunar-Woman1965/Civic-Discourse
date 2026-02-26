
import ResetPasswordForm from '@/components/auth/reset-password-form'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function ResetPasswordPage() {
  const user = await getCurrentUser()
  
  if (user) {
    redirect('/dashboard')
  }

  return <ResetPasswordForm />
}
