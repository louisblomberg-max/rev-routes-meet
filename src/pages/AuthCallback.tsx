import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('Signing you in...')

  useEffect(() => {
    const handle = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session?.user) {
          console.error('[AuthCallback] No session:', error)
          setMessage('Something went wrong')
          setTimeout(() => navigate('/auth', { replace: true }), 1500)
          return
        }

        const userId = session.user.id
        console.log('[AuthCallback] Got session for user:', userId)

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', userId)
          .maybeSingle()

        console.log('[AuthCallback] Profile result:', profile, profileError)

        if (profileError || !profile) {
          console.log('[AuthCallback] No profile — sending to onboarding')
          navigate('/onboarding', { replace: true })
          return
        }

        if (profile.onboarding_complete === true) {
          console.log('[AuthCallback] Complete — sending to map')
          navigate('/', { replace: true })
        } else {
          console.log('[AuthCallback] Incomplete — sending to onboarding')
          navigate('/onboarding', { replace: true })
        }

      } catch (err) {
        console.error('[AuthCallback] Caught error:', err)
        navigate('/auth', { replace: true })
      }
    }

    handle()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  )
}