import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

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
    .single()

  // Fetch available tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

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
            <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back, {profile?.full_name || user.email}</p>
          </div>
          <form
            action={async () => {
              'use server'
              const supabase = await createClient()
              await supabase.auth.signOut()
              redirect('/auth/login')
            }}
          >
            <Button variant="outline">Sign Out</Button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Available Tasks */}
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
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Submit Solution</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-600">No tasks available yet. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </div>

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
