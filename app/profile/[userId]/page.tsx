import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Github, Linkedin, Briefcase, Award, ExternalLink, Clock, Globe, Mail, MapPin, Star, Trophy } from 'lucide-react'
import { UserNav } from '@/components/user-nav'
import { extractUsername, getGitHubStats, getGitHubActivity, getGitHubRepos } from '@/lib/github'
import Link from 'next/link'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const supabase = await createClient()

  // 1. Fetch target profile
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (!profile) {
    notFound()
  }

  // 2. Fetch submissions (Flat query for maximum RLS compatibility)
  const { data: submissions, error: subError } = await supabase
    .from('submissions')
    .select('*')
    .eq('student_id', userId)
    .ilike('status', 'approved')
    .order('submitted_at', { ascending: false })

  // 3. Fetch tasks separately (to avoid Join RLS issues)
  const taskIds = submissions?.map(s => s.task_id) || []
  const { data: tasks } = taskIds.length > 0 
    ? await supabase.from('tasks').select('*').in('id', taskIds)
    : { data: [] }

  // 4. Map them together
  const portfolio = submissions?.map(sub => ({
    ...sub,
    task: tasks?.find(t => t.id === sub.task_id)
  })).filter(item => item.task) || []

  // 5. Fetch viewer info
  const { data: { user: viewer } } = await supabase.auth.getUser()
  let viewerProfile = null
  if (viewer) {
    const { data: vProfile } = await supabase.from('student_profiles').select('*').eq('id', viewer.id).maybeSingle()
    viewerProfile = vProfile
  }

  // 6. GitHub Data
  const githubUsername = extractUsername(profile.github_url || '')
  const githubStats = githubUsername ? await getGitHubStats(githubUsername) : null
  const githubRepos = githubUsername ? await getGitHubRepos(githubUsername) : []

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-slate-900">SkillProof</Link>
          {viewer && viewerProfile && (
            <UserNav user={viewer} profile={viewerProfile} />
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <Card className="overflow-hidden border-none shadow-lg">
              <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700" />
              <CardContent className="pt-0 -mt-12 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-white bg-slate-200 text-3xl font-bold text-slate-600 mb-4 shadow-sm">
                  {profile.full_name?.[0].toUpperCase() || 'U'}
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{profile.full_name}</h1>
                <p className="text-slate-500 text-sm mb-4 uppercase tracking-widest font-semibold">{profile.role}</p>
                
                <div className="flex justify-center gap-3 mb-6">
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                      <Github className="w-5 h-5 text-slate-700" />
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                      <Linkedin className="w-5 h-5 text-blue-600" />
                    </a>
                  )}
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100 text-left">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 text-sm">Credibility Score</span>
                    <span className="text-blue-600 font-extrabold text-lg">{profile.credibility_score || 0}</span>
                  </div>
                  
                  <Link href={`/verify/${userId}`} className="w-full block">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold gap-2 shadow-md shadow-green-100 border-none">
                      <CheckCircle className="w-4 h-4" /> Blockchain Verification
                    </Button>
                  </Link>

                  {profile.role === 'mentor' && (
                    <div className="flex justify-between items-start gap-2 pt-4 border-t border-slate-50 mt-4">
                       <Briefcase className="w-4 h-4 text-slate-400 mt-0.5" />
                       <div className="flex-1">
                          <p className="text-xs font-bold leading-tight">{profile.position}</p>
                          <p className="text-[10px] text-slate-500">{profile.company_name}</p>
                       </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-8">
             {githubStats && (
              <Card className="border-none bg-slate-900 text-white overflow-hidden relative shadow-xl">
                <div className="absolute top-0 right-0 p-6 opacity-10 font-sans">
                  <Github className="w-16 h-16" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">GitHub Developer Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <p className="text-2xl font-bold">{githubStats.publicRepos}</p>
                      <p className="text-xs text-slate-400 uppercase">Repositories</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{githubStats.totalStars}</p>
                      <p className="text-xs text-slate-400 uppercase">Stars Earned</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{githubStats.followers}</p>
                      <p className="text-xs text-slate-400 uppercase">Followers</p>
                    </div>
                    <div className="flex items-end">
                      <a href={`https://github.com/${githubStats.username}`} target="_blank" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        View Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Verified Portfolio ({portfolio.length})
              </h2>

              {portfolio.length > 0 ? (
                <div className="grid gap-4">
                  {portfolio.map((item: any) => (
                    <Card key={item.id} className="hover:border-blue-200 transition-colors group">
                      <CardHeader className="py-4">
                        <div className="flex justify-between items-start">
                           <div>
                             <div className="flex items-center gap-2 mb-1">
                               <Badge variant="outline" className="text-[10px] uppercase font-bold text-blue-600 border-blue-100">{item.task?.category || 'General'}</Badge>
                               <span className="text-[10px] text-slate-400">•</span>
                               <span className="text-[10px] text-slate-400 font-medium">{new Date(item.submitted_at).toLocaleDateString()}</span>
                             </div>
                             <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{item.task?.title}</CardTitle>
                           </div>
                           <div className="flex flex-col items-end gap-1">
                             <div className="flex items-center gap-1 text-[10px] font-bold text-purple-600 uppercase tracking-tighter bg-purple-50 px-2 py-0.5 rounded border border-purple-100 shadow-sm">
                               <Trophy className="w-2.5 h-2.5" /> Verified
                             </div>
                             {(item.smart_contract_tx_hash || item.blockchain_hash) && (
                               <span className="text-[8px] font-mono text-slate-300">
                                 { (item.smart_contract_tx_hash || item.blockchain_hash).slice(0, 10) }...
                               </span>
                             )}
                           </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <p className="text-sm text-slate-600 line-clamp-2 mb-4 italic">{item.submission_text}</p>
                        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                           {item.ipfs_hash && (
                             <a href={`https://gateway.pinata.cloud/ipfs/${item.ipfs_hash}`} target="_blank" className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1">
                               <ExternalLink className="w-3 h-3" /> View Proof of Work
                             </a>
                           )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-slate-100 border-none py-12 text-center text-slate-500 italic">
                  <p>No verified work items found for this record.</p>
                </Card>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
