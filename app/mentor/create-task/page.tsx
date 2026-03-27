'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function CreateTask() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(true)
  const [rooms, setRooms] = useState<any[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string>('')

  useEffect(() => {
    async function fetchRooms() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('mentorship_rooms')
          .select('*')
          .eq('mentor_id', user.id)
        if (data) setRooms(data)
      }
    }
    fetchRooms()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !description.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error: createError } = await supabase
        .from('tasks')
        .insert({
          title,
          description,
          category,
          difficulty_level: difficultyLevel,
          creator_id: user.id,
          is_public: isPublic,
          room_id: selectedRoomId || null,
        })

      if (createError) throw createError

      // Reset form and redirect
      setTitle('')
      setDescription('')
      setCategory('')
      setDifficultyLevel('beginner')

      setTimeout(() => {
        router.push('/mentor')
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/mentor" className="text-blue-600 hover:text-blue-700 text-sm mb-4 block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Create New Task</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle>New Skill Task</CardTitle>
            <CardDescription>Create a new task for students to submit solutions for</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Build a React Todo App"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students need to do, requirements, and evaluation criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-32"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Frontend, Backend, Design"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level *</Label>
                  <select
                    id="difficulty"
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <Label className="text-base font-semibold">Task Visibility</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPublic(true)
                      setSelectedRoomId('')
                    }}
                    className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${
                      isPublic 
                        ? 'border-blue-600 bg-blue-50 text-blue-900' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-bold text-sm">Global Task</p>
                    <p className="text-xs opacity-80">Visible to all students on the platform.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${
                      !isPublic 
                        ? 'border-purple-600 bg-purple-50 text-purple-900' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-bold text-sm">Private Task</p>
                    <p className="text-xs opacity-80">Only visible to your mentored students.</p>
                  </button>
                </div>
              </div>

              {!isPublic && rooms.length > 0 && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="roomSelection">Assign to Mentorship Room (Optional)</Label>
                  <select
                    id="roomSelection"
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value="">All my Mentees</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 italic">Select a specific room to restrict this task further, or leave as "All my Mentees".</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Task'}
                </Button>
                <Link href="/mentor" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
