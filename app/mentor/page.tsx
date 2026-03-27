import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Building2, Calendar, CheckCircle, Clock, ExternalLink, Link2, Users, XCircle } from 'lucide-react'
import { UserNav } from '@/components/user-nav'
import { InviteLink } from '@/components/invite-link'

export default async function MentorDashboard() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch mentor profile
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Verify user is a mentor
  if (profile?.role !== 'mentor') {
    redirect('/student')
  }

  // Fetch all submissions that need review
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      *,
      student_id (
        id,
        full_name,
        email
      ),
      task_id (
        id,
        title,
        description,
        difficulty_level
      )
    `)
    .order('submitted_at', { ascending: false })

  // Fetch available tasks (for creating new ones)
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  const pendingSubmissions = submissions?.filter((s: any) => s.status === 'pending') || []
  const reviewedSubmissions = submissions?.filter((s: any) => s.status !== 'pending') || []

  // Fetch rooms
  const { data: rooms } = await supabase
    .from('mentorship_rooms')
    .select('*')
    .eq('mentor_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch mentees
  const { data: menteeData } = await supabase
    .from('mentorships')
    .select(`
      student_id (
        id,
        full_name,
        email,
        github_url,
        credibility_score,
        submissions (
          id,
          status
        )
      )
    `)
    .eq('mentor_id', user.id)

  const mentees = menteeData?.map((m: any) => {
    const s = m.student_id
    if (!s) return null
    const approvedCount = s.submissions?.filter((sub: any) => sub.status === 'approved').length || 0
    return { ...s, approvedCount }
  }).filter(Boolean) || []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mentor Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome, {profile?.full_name || user.email}</p>
          </div>
          <div className="flex items-center gap-6">
            <UserNav user={user} profile={profile!} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Mentorship Rooms Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              Mentorship Rooms
            </h2>
            <Link href="/mentor/rooms/create">
              <Button className="bg-blue-600 hover:bg-blue-700">+ Create Room</Button>
            </Link>
          </div>

          {rooms && rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((room) => (
                <div key={room.id} className="space-y-4">
                  <InviteLink 
                    mentorId={user.id} 
                    inviteCode={room.invite_code} 
                    title={room.title} 
                  />
                  <Card className="border-slate-100 shadow-sm border-t-0 -mt-8 rounded-t-none">
                    <CardContent className="pt-4 flex flex-col gap-2">
                       <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {room.period || 'TBD'}</span>
                          {room.start_date && (
                             <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(room.start_date).toLocaleDateString()}</span>
                          )}
                       </div>
                       <p className="text-sm text-slate-600 line-clamp-2">{room.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-50 border-dashed py-12 text-center">
              <CardContent>
                <p className="text-slate-500 italic mb-4">You haven't created any mentorship rooms yet.</p>
                <Link href="/mentor/rooms/create">
                  <Button variant="outline" className="border-blue-200 text-blue-600">Get Started with a Room</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-slate-900">{pendingSubmissions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">
                {submissions?.filter((s: any) => s.status === 'approved').length || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Total Mentees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-purple-600">{mentees.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-12 flex gap-4">
          <Link href="/mentor/create-task">
            <Button className="bg-green-600 hover:bg-green-700">+ Create New Task</Button>
          </Link>
        </div>

        {/* My Mentees */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6" />
            My Mentees
          </h2>
          
          {mentees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentees.map((mentee: any) => (
                <Card key={mentee.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-md">{mentee.full_name}</CardTitle>
                        <CardDescription className="text-xs truncate">{mentee.email}</CardDescription>
                        <div className="flex gap-2">
                          <Link href={`/profile/${mentee.id}`}>
                            <Button variant="outline" size="sm" className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold px-3">
                              View Profile
                            </Button>
                          </Link>
                          <Link href={`/recruiter/${mentee.id}`} target="_blank">
                             <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:bg-blue-50 font-bold px-3 flex items-center gap-1.5 border border-transparent hover:border-blue-100">
                                <ExternalLink className="w-3.5 h-3.5" /> Recruiter View
                             </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-medium">Score: {mentee.credibility_score || 0}</span>
                        <span className="text-blue-600 font-bold">{mentee.approvedCount || 0} Tasks Completed</span>
                      </div>
                      {mentee.github_url && (
                        <a href={mentee.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                          <Link2 className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-50/50 border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-slate-500 text-sm italic">You don't have any mentees yet. Share your invite link to get started!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pending Submissions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Pending Review ({pendingSubmissions.length})
          </h2>
          
          {pendingSubmissions.length > 0 ? (
            <div className="space-y-4">
              {pendingSubmissions.map((submission: any) => (
                <Card key={submission.id} className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{submission.task_id?.title}</CardTitle>
                        <CardDescription className="mt-2">
                          Submitted by <span className="font-semibold text-slate-900">{submission.student_id?.full_name}</span> on{' '}
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Link href={`/mentor/review/${submission.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700">Review</Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm line-clamp-2">{submission.submission_text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-slate-600">All submissions reviewed!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recently Reviewed */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Recently Reviewed</h2>
          
          {reviewedSubmissions.length > 0 ? (
            <div className="space-y-4">
              {reviewedSubmissions.slice(0, 5).map((submission: any) => (
                <Card key={submission.id} className="border-l-4 border-l-slate-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(submission.status)}
                          <CardTitle className="text-lg">{submission.task_id?.title}</CardTitle>
                        </div>
                        <CardDescription>
                          {submission.student_id?.full_name} • {new Date(submission.submitted_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        submission.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {submission.status}
                      </span>
                    </div>
                  </CardHeader>
                  {submission.feedback && (
                    <CardContent>
                      <div className="bg-slate-50 p-3 rounded text-sm text-slate-700">
                        <p className="font-semibold mb-1">Feedback:</p>
                        <p>{submission.feedback}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-600">No submissions reviewed yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
