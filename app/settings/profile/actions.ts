'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: {
  full_name: string
  github_url: string | null
  linkedin_url: string | null
  company_name?: string | null
  position?: string | null
  experience?: string | null
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('student_profiles')
    .update({
      full_name: formData.full_name,
      github_url: formData.github_url,
      linkedin_url: formData.linkedin_url,
      company_name: formData.company_name,
      position: formData.position,
      experience: formData.experience,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/student')
  revalidatePath('/mentor')
  revalidatePath('/settings/profile')

  return { success: true }
}
