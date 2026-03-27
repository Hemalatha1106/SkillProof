import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Building2, Calendar, CheckCircle, Clock, Code2, ExternalLink, GitBranch, Github, Link2, Search, Star, Users, XCircle } from 'lucide-react'
import { UserNav } from '@/components/user-nav'
import { extractUsername, getGitHubStats, getGitHubActivity, getGitHubRepos } from '@/lib/github'

export default async function StudentDashboard() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch student profile
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Fetch mentorship info
  const { data: mentorship } = await supabase
    .from('mentorships')
    .select('mentor_id(id, full_name, company_name, position), room_id(id, title, description, period, start_date, end_date, company_details)')
    .eq('student_id', user.id)
    .maybeSingle()

  const mentor = mentorship?.mentor_id as any
  const room = mentorship?.room_id as any

  // Fetch available tasks (ONLY if student has a mentor/room)
  let tasks: any[] = []
  if (mentorship) {
    let tasksQuery = supabase
      .from('tasks')
      .select('*')
      .or(`is_public.eq.true${mentor?.id ? `,creator_id.eq.${mentor.id}` : ''}${room?.id ? `,room_id.eq.${room.id}` : ''}`)
      .order('created_at', { ascending: false })

    const { data: fetchedTasks } = await tasksQuery
    tasks = fetchedTasks || []
  }

  // Fetch GitHub Data
  const githubUsername = extractUsername(profile?.github_url || '')
  const githubStats = githubUsername ? await getGitHubStats(githubUsername) : null
  const githubRepos = githubUsername ? await getGitHubRepos(githubUsername) : []
  const githubActivity = githubUsername ? await getGitHubActivity(githubUsername) : []

  // Fetch student's submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false })

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              Student Dashboard
              {githubStats && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-200 shadow-sm">
                  <Github className="w-3 h-3" /> Verified Developer
                </span>
              )}
            </h1>
            <p className="text-slate-600 mt-1">Welcome back, {profile?.full_name || user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/recruiter/${user.id}`} target="_blank">
               <Button variant="outline" className="h-9 border-blue-200 text-blue-600 hover:bg-blue-50 font-bold px-4 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Share Recruiter Link
               </Button>
            </Link>
            <UserNav user={user} profile={profile!} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Mentorship Section */}
        <div className="mb-12">
          {mentorship ? (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-100">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{room?.title || 'Active Mentorship'}</h2>
                      <p className="text-sm text-slate-500">Mentored by <strong>{mentor?.full_name || 'Your Mentor'}</strong> {mentor?.company_name ? `at ${mentor.company_name}` : ''}</p>
                    </div>
                  </div>
                  {mentor?.id && (
                    <Link href={`/profile/${mentor.id}`}>
                      <Button variant="outline" size="sm" className="bg-white border-blue-200 text-blue-600 hover:bg-blue-50">
                        View Mentor Profile
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {room && (
                  <>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{room.description}</p>
                    <div className="flex gap-4 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-blue-700 bg-blue-100/50 px-2 py-1 rounded">
                         <Clock className="w-3 h-3" /> {room.period || 'TBD'}
                      </span>
                      {room.start_date && (
                        <span className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2 py-1 rounded">
                           <Calendar className="w-3 h-3" /> {new Date(room.start_date).toLocaleDateString()} Start
                        </span>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-slate-300 bg-slate-50/50">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Connect with a Mentor</CardTitle>
                <CardDescription>Enter an invite code to join a mentorship room and get exclusive tasks.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex gap-2 max-w-md mx-auto" action={async (formData) => {
                  'use server'
                  const code = formData.get('inviteCode') as string
                  if (code) {
                    redirect(`/invite/${code}`)
                  }
                }}>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 font-bold" />
                    <Input name="inviteCode" placeholder="Enter Invite Code (e.g. 5a2b8e3...)" className="pl-9 bg-white" />
                  </div>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-bold">Find Room</Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* GitHub Connection Prompt (if missing) */}
        {!githubStats && (
          <div className="mb-12">
            <Card className="border-slate-200 bg-slate-100/30 border-dashed relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Github className="w-32 h-32" />
               </div>
               <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">Unlock Developer Insights</CardTitle>
                  <CardDescription>Connect your GitHub profile to showcase your activity, repositories, and proof of work to mentors.</CardDescription>
               </CardHeader>
               <CardContent className="flex justify-center pb-6">
                  <Link href="/settings/profile">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2 px-8 font-bold">
                       <Github className="w-4 h-4" /> Connect GitHub Profile
                    </Button>
                  </Link>
               </CardContent>
            </Card>
          </div>
        )}

        {/* GitHub Insights Section */}
        {githubStats && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Github className="w-6 h-6" /> GitHub Developer Insights
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Overview */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Github className="w-24 h-24" />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <img src={githubStats.avatarUrl} alt={githubStats.username} className="w-12 h-12 rounded-full border-2 border-slate-700" />
                      <div>
                        <CardTitle className="text-lg">@{githubStats.username}</CardTitle>
                        <CardDescription className="text-slate-400">Verifed Developer</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600/50 text-center">
                      <p className="text-2xl font-bold">{githubStats.publicRepos}</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Repositories</p>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600/50 text-center">
                      <p className="text-2xl font-bold">{githubStats.totalStars}</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Stars</p>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600/50 text-center col-span-2">
                      <div className="flex justify-around items-center h-full">
                        <div>
                          <p className="text-xl font-bold">{githubStats.followers}</p>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Followers</p>
                        </div>
                        <div className="w-px h-8 bg-slate-600"></div>
                        <div>
                          <p className="text-xl font-bold">{githubStats.following}</p>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Following</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Repositories */}
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-slate-400" /> Recent Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {githubRepos.slice(0, 3).map(repo => (
                      <div key={repo.id} className="group">
                        <a href={repo.url} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center hover:bg-slate-50 p-2 rounded -mx-2 transition-colors">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate text-slate-800">{repo.name}</p>
                            <p className="text-[10px] text-slate-500">{repo.language || 'Code'}</p>
                          </div>
                          <Star className="w-3 h-3 text-slate-300 group-hover:text-yellow-500" />
                        </a>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Activity Timeline */}
              <div className="lg:col-span-2">
                <Card className="h-full border-slate-200">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Recent GitHub Activity</CardTitle>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Live Updates
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
                      {githubActivity.length > 0 ? githubActivity.map((event) => (
                        <div key={event.id} className="relative flex items-center justify-between gap-6 group">
                          <div className="flex items-center gap-4">
                            <div className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white shadow shadow-slate-100 ${
                              event.type === 'PushEvent' ? 'bg-blue-600' :
                              event.type === 'CreateEvent' ? 'bg-green-600' :
                              'bg-purple-600'
                            }`}>
                              <Code2 className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {event.type === 'PushEvent' ? 'Committed to' : 
                                 event.type === 'CreateEvent' ? 'Created repository' : 
                                 'Activity in'}
                                <span className="ml-1 text-blue-600">{event.repo.split('/')[1]}</span>
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(event.createdAt).toLocaleDateString()} at {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <a href={event.repoUrl} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                             <ExternalLink className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                          </a>
                        </div>
                      )) : (
                        <div className="py-12 text-center">
                          <p className="text-slate-400 text-sm italic">No recent public activity found.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Available Tasks (Only visible if mentorship exists) */}
        {mentorship && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Available Tasks</h2>
            </div>
            
            {tasks && tasks.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {tasks.map((task: any) => (
                  <Card key={task.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <CardDescription className="mt-2">{task.description}</CardDescription>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          task.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                          task.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {task.difficulty_level}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/student/submit/${task.id}`}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold">Submit Solution</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-50 border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-slate-500 italic">No tasks assigned to your room yet. Check back soon!</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* My Submissions */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">My Submissions</h2>
          
          {submissions && submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((submission: any) => {
                const task = tasks?.find((t: any) => t.id === submission.task_id)
                return (
                  <Card key={submission.id} className={`border ${getStatusColor(submission.status)}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {getStatusIcon(submission.status)}
                            {task?.title}
                          </CardTitle>
                          <CardDescription className="mt-2 text-slate-700">
                            Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <span className="text-sm font-semibold capitalize">{submission.status}</span>
                      </div>
                    </CardHeader>
                    {submission.feedback && (
                      <CardContent>
                        <div className="bg-white/50 p-4 rounded border border-current/20">
                          <p className="text-sm font-semibold mb-1">Feedback:</p>
                          <p className="text-sm">{submission.feedback}</p>
                        </div>
                      </CardContent>
                    )}
                    {submission.blockchain_hash && submission.status === 'approved' && (
                      <CardContent>
                        <div className="bg-white/50 p-4 rounded border border-current/20">
                          <p className="text-sm font-semibold mb-1">Verification Hash:</p>
                          <p className="text-xs font-mono break-all">{submission.blockchain_hash}</p>
                          <Link href={`/verify/${user.id}`} className="text-xs underline mt-2 block">
                            View public certificate
                          </Link>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-600">No submissions yet. Start by submitting a task!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
