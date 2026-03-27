'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'



export async function acceptRoomInvite(inviteCode: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Fetch room details
  const { data: room, error: roomError } = await supabase
    .from('mentorship_rooms')
    .select('id, mentor_id')
    .eq('invite_code', inviteCode)
    .single()

  if (roomError || !room) {
    throw new Error('Invalid invite code.')
  }

  // Check if student already has a mentor
  const { data: existing } = await supabase
    .from('mentorships')
    .select('id')
    .eq('student_id', user.id)
    .single()

  if (existing) {
    throw new Error('You already have a mentor assigned.')
  }

  const { error } = await supabase.from('mentorships').insert({
    mentor_id: room.mentor_id,
    student_id: user.id,
    room_id: room.id,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/student')
  revalidatePath('/mentor')

  return { success: true }
}

