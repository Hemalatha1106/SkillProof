'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import crypto from 'crypto'

export default function ReviewSubmission() {
  const router = useRouter()
  const params = useParams()
  const submissionId = params.submissionId as string

  const [submission, setSubmission] = useState<any>(null)
  const [student, setStudent] = useState<any>(null)
  const [task, setTask] = useState<any>(null)
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const initPage = async () => {
      const supabase = createClient()
      
      // Get current user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      setUser(currentUser)

      // Fetch submission
      const { data: submissionData } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', submissionId)
        .single()

      if (submissionData) {
        setSubmission(submissionData)

        // Fetch student
        const { data: studentData } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('id', submissionData.student_id)
          .single()

        setStudent(studentData)

        // Fetch task
        const { data: taskData } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', submissionData.task_id)
          .single()

        setTask(taskData)
      }
    }

    initPage()
  }, [submissionId, router])

  const generateBlockchainHash = (text: string): string => {
    // Mock blockchain hash using SHA-256
    const hash = crypto.createHash('sha256')
    hash.update(text + Date.now())
    return hash.digest('hex')
  }

  const handleApprove = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Generate blockchain hash
      const blockchainHash = generateBlockchainHash(
        `${submission.id}-${submission.student_id}-${submission.task_id}`
      )

      const { error: updateError } = await supabase
        .from('submissions')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          feedback: feedback,
          blockchain_hash: blockchainHash,
        })
        .eq('id', submissionId)

      if (updateError) throw updateError

      // Redirect back to mentor dashboard
      setTimeout(() => {
        router.push('/mentor')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve submission')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!feedback.trim()) {
      setError('Please provide feedback for rejection')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from('submissions')
        .update({
          status: 'rejected',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          feedback: feedback,
        })
        .eq('id', submissionId)

      if (updateError) throw updateError

      // Redirect back to mentor dashboard
      setTimeout(() => {
        router.push('/mentor')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject submission')
    } finally {
      setIsLoading(false)
    }
  }

  if (!submission || !student || !task) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/mentor" className="text-blue-600 hover:text-blue-700 text-sm mb-4 block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Review Submission</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Student & Task Info */}
          <div className="md:col-span-1 space-y-6">
            {/* Student Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Name</p>
                  <p className="font-semibold">{student.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="text-sm break-all">{student.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Submitted</p>
                  <p className="text-sm">{new Date(submission.submitted_at).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Task Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{task.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Difficulty</p>
                  <p className="font-semibold capitalize">{task.difficulty_level}</p>
                </div>
                {task.category && (
                  <div>
                    <p className="text-sm text-slate-600">Category</p>
                    <p className="text-sm">{task.category}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-600">Description</p>
                  <p className="text-sm">{task.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submission & Review */}
          <div className="md:col-span-2 space-y-6">
            {/* Student Submission */}
            <Card>
              <CardHeader>
                <CardTitle>Student&apos;s Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-6 rounded border border-slate-200 max-h-64 overflow-y-auto">
                  <p className="text-slate-800 whitespace-pre-wrap">{submission.submission_text}</p>
                </div>
              </CardContent>
            </Card>

            {/* Review Form */}
            <Card>
              <CardHeader>
                <CardTitle>Your Review</CardTitle>
                <CardDescription>Provide feedback and make your decision</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Provide constructive feedback for the student..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="min-h-32"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={handleApprove}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : '✓ Approve & Verify'}
                  </Button>
                  <Button
                    onClick={handleReject}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    disabled={isLoading}
                  >
                    ✕ Request Changes
                  </Button>
                  <Link href="/mentor" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
