import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

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
    .single()

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
              <CardTitle className="text-sm text-slate-600">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-600">{tasks?.length || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-12 flex gap-4">
          <Link href="/mentor/create-task">
            <Button className="bg-green-600 hover:bg-green-700">+ Create New Task</Button>
          </Link>
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
