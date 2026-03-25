import SignInForm from '@/components/auth/signin-form'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import BMCWidget from './bmc-widget'

export default async function SignInPage() {
  const user = await getCurrentUser()
  
  if (user) {
    redirect('/dashboard')
  }

  return (
    <>
      <SignInForm />
      <BMCWidget />
    </>
  )
}