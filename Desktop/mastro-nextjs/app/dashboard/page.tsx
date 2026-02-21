import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import MastroApp from '@/components/MastroApp'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch dati azienda dell'utente
  const { data: azienda } = await supabase
    .from('aziende')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  return <MastroApp user={user} azienda={azienda} />
}
