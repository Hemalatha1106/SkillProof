import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from './profile-form'
import { UserNav } from '@/components/user-nav'
import Link from 'next/link'
import { ChevronRight, Settings } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href={`/${profile.role}`} className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors">
              SkillProof
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Settings</span>
          </div>
          <UserNav user={user} profile={profile} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
        </div>

        <ProfileForm profile={profile} />
      </main>
    </div>
  )
}
