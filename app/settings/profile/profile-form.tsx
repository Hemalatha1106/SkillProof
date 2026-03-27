'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { updateProfile } from './actions'
import { toast } from 'sonner'

interface ProfileFormProps {
  profile: {
    full_name: string
    github_url: string | null
    linkedin_url: string | null
    company_name?: string | null
    position?: string | null
    experience?: string | null
    role: string
  }
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    github_url: profile.github_url || '',
    linkedin_url: profile.linkedin_url || '',
    company_name: profile.company_name || '',
    position: profile.position || '',
    experience: profile.experience || '',
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateProfile({
        ...formData,
        github_url: formData.github_url || null,
        linkedin_url: formData.linkedin_url || null,
        company_name: profile.role === 'mentor' ? formData.company_name : null,
        position: profile.role === 'mentor' ? formData.position : null,
        experience: profile.role === 'mentor' ? formData.experience : null,
      })
      toast.success('Profile updated successfully!')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            Update your personal and professional information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              placeholder="John Doe"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub Profile URL</Label>
              <Input
                id="github_url"
                type="url"
                placeholder="https://github.com/username"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                required={profile.role === 'student'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn Profile URL (Optional)</Label>
              <Input
                id="linkedin_url"
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              />
            </div>
          </div>

          {profile.role === 'mentor' && (
            <div className="space-y-4 pt-4 border-t border-slate-100 mt-4">
              <p className="text-sm font-semibold text-slate-900 border-l-2 border-blue-600 pl-2 uppercase tracking-wide">Professional Details (Mentor)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    placeholder="Acme Corp"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Current Position</Label>
                  <Input
                    id="position"
                    placeholder="Senior Software Engineer"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  placeholder="e.g. 5+ years"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  required
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-slate-100 pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
