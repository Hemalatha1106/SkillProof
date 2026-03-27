'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'

export default function SubmitTask() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.taskId as string

  const [task, setTask] = useState<any>(null)
  const [submissionText, setSubmissionText] = useState('')
  const [file, setFile] = useState<File | null>(null)
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

      // Fetch task
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()

      if (taskData) {
        setTask(taskData)
      }
    }

    initPage()
  }, [taskId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!submissionText.trim()) {
      setError('Please enter a submission')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: submitError } = await supabase
        .from('submissions')
        .insert({
          student_id: user.id,
          task_id: taskId,
          submission_text: submissionText,
          status: 'pending',
        })
        .select()

      if (submitError) throw submitError

      // Reset form
      setSubmissionText('')
      setFile(null)

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/student')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit task')
    } finally {
      setIsLoading(false)
    }
  }

  if (!task) {
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
          <Link href="/student" className="text-blue-600 hover:text-blue-700 text-sm mb-4 block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Submit Solution</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Task Details */}
          <div className="md:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">{task.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Difficulty</p>
                  <p className="font-semibold capitalize">{task.difficulty_level}</p>
                </div>
                {task.category && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Category</p>
                    <p className="font-semibold">{task.category}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-600 mb-1">Description</p>
                  <p className="text-sm">{task.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submission Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Solution</CardTitle>
                <CardDescription>Submit your work for mentor review</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="submission">Solution Text</Label>
                    <Textarea
                      id="submission"
                      placeholder="Describe your solution, paste code, or provide details about your work..."
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      className="min-h-64"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">Upload File (Optional)</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx,.txt,.zip,.py,.js,.ts,.jsx,.tsx"
                    />
                    <p className="text-xs text-slate-600">
                      Supported: PDF, DOC, TXT, ZIP, or code files
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                      {isLoading ? 'Submitting...' : 'Submit Solution'}
                    </Button>
                    <Link href="/student" className="flex-1">
                      <Button type="button" variant="outline" className="w-full">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
