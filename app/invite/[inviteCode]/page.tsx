import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserCheck, ShieldCheck, ArrowRight, Building2, Calendar, Clock } from 'lucide-react'
import { acceptRoomInvite } from '../actions'

export default async function RoomInvitePage({
  params,
}: {
  params: Promise<{ inviteCode: string }>
}) {
  const { inviteCode } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?returnTo=/invite/${inviteCode}`)
  }

  // Fetch room details
  const { data: room } = await supabase
    .from('mentorship_rooms')
    .select(`
      *,
      mentor_id (
        id,
        full_name,
        email,
        company_name,
        position
      )
    `)
    .eq('invite_code', inviteCode)
    .maybeSingle()

  if (!room || !room.mentor_id) {
    notFound()
  }

  const mentor = room.mentor_id as any

  // Check if student already has a mentor
  const { data: currentMentorship } = await supabase
    .from('mentorships')
    .select('mentor_id, room_id')
    .eq('student_id', user.id)
    .single()

  if (currentMentorship) {
    if (currentMentorship.room_id === room.id) {
      redirect('/student')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-xl w-full shadow-2xl border-slate-200">
        <CardHeader className="text-left border-b border-slate-100 pb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              INVITATION
            </div>
          </div>
          <CardTitle className="text-3xl font-extrabold text-slate-900 leading-tight">
            {room.title}
          </CardTitle>
          <CardDescription className="text-lg text-slate-500 mt-2">
            Professional Mentorship by <strong>{mentor.full_name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          {/* Program Overview */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Program Overview</h3>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{room.description}</p>
          </section>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3 items-center">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Duration</p>
                <p className="text-sm font-semibold text-slate-900">{room.period || 'Not Specified'}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3 items-center">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Schedule</p>
                <p className="text-sm font-semibold text-slate-900">
                  {room.start_date ? new Date(room.start_date).toLocaleDateString() : 'TBD'} 
                  {room.end_date ? ` to ${new Date(room.end_date).toLocaleDateString()}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Company Details */}
          {room.company_details && (
            <section className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <h3 className="text-[10px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-3 h-3" /> About the Company
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">{room.company_details}</p>
            </section>
          )}

          {/* Mentor Profile Sneak Peek */}
          <section className="flex items-center gap-4 border-t border-slate-100 pt-6 mt-6">
            <div className="bg-slate-200 w-12 h-12 rounded-full flex items-center justify-center font-bold text-slate-600">
              {mentor.full_name[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{mentor.full_name}</p>
              <p className="text-xs text-slate-500">{mentor.position} at {mentor.company_name}</p>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto text-blue-600 hover:text-blue-700" asChild>
              <a href={`/profile/${mentor.id}`} target="_blank">View Profile</a>
            </Button>
          </section>

          {currentMentorship && (
             <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 font-medium">
             ⚠️ You are already in a mentorship. Joining this will associate you with this room.
           </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-8 px-8">
          <form action={async () => {
            'use server'
            await acceptRoomInvite(inviteCode)
            redirect('/student')
          }} className="w-full">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg font-bold shadow-xl shadow-blue-200">
              Join Mentorship Room <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>
          <Button variant="ghost" className="w-full text-slate-400 hover:text-slate-600" asChild>
            <a href="/student">Dismiss Invitation</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
