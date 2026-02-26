
import SignUpForm from '@/components/auth/signup-form'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function SignUpPage() {
  const user = await getCurrentUser()
  
  if (user) {
    redirect('/dashboard')
  }

  return <SignUpForm />
}
