'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Building2, Calendar, ClipboardList } from 'lucide-react'

export default function CreateRoom() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    period: '',
    start_date: '',
    end_date: '',
    company_details: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('mentorship_rooms')
        .insert({
          mentor_id: user.id,
          title: formData.title,
          description: formData.description,
          period: formData.period,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          company_details: formData.company_details,
        })

      if (error) throw error

      toast.success('Mentorship Room created!')
      router.push('/mentor')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create room')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto mb-8">
        <Link href="/mentor" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Create Mentorship Room</h1>
        <p className="text-slate-600 mt-2">Define the internship details and invite your students.</p>
      </div>

      <main className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Internship Details</CardTitle>
              <CardDescription>This information will be shown to students when they use your invite link.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Internship Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Summer Backend Internship 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Program Description *</Label>
                <Textarea
                  id="description"
                  placeholder="What will the students learn? What are the expectations?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-32"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="period">Duration/Period (e.g. 3 Months)</Label>
                  <Input
                    id="period"
                    placeholder="3 Months"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  />
                </div>
                <div className="space-y-2 text-slate-400">
                  <Label htmlFor="dates" className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Dates (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <Label htmlFor="company" className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Company Details</Label>
                <Textarea
                  id="company"
                  placeholder="About the company, location, etc."
                  value={formData.company_details}
                  onChange={(e) => setFormData({ ...formData, company_details: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t border-slate-100 py-6 flex justify-end gap-4">
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? 'Creating Room...' : 'Create Room & Generate Invite'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  )
}
