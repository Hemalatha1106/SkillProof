import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Github, Linkedin, ExternalLink, ShieldCheck, Mail, Briefcase, Award, Globe, GitBranch, Star, Code2, Clock, Trophy } from 'lucide-react'
import { extractUsername, getGitHubStats, getGitHubRepos } from '@/lib/github'
import Link from 'next/link'

export default async function RecruiterProfilePage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params
  const supabase = await createClient()

  // 1. Fetch Student Profile
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', studentId)
    .maybeSingle()

  if (!profile) {
    notFound()
  }

  // 2. Fetch GitHub Analytics
  const githubUsername = extractUsername(profile.github_url || '')
  const githubStats = githubUsername ? await getGitHubStats(githubUsername) : null
  const githubRepos = githubUsername ? await getGitHubRepos(githubUsername) : []

  // 3. Fetch Blockchain-Verified Portfolio (FLAT FETCH for RLS safety)
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('student_id', studentId)
    .ilike('status', 'approved')
    .order('submitted_at', { ascending: false })

  // 4. Fetch related data separately
  const taskIds = submissions?.map(s => s.task_id) || []
  const mentorIds = submissions?.map(s => s.approved_by).filter(Boolean) || []

  const { data: tasks } = taskIds.length > 0 
    ? await supabase.from('tasks').select('*').in('id', taskIds)
    : { data: [] }

  const { data: mentors } = mentorIds.length > 0
    ? await supabase.from('student_profiles').select('id, full_name, company_name').in('id', mentorIds)
    : { data: [] }

  // 5. Build portfolio
  const portfolio = submissions?.map(sub => ({
    ...sub,
    task: tasks?.find(t => t.id === sub.task_id),
    mentor: mentors?.find(m => m.id === sub.approved_by)
  })).filter(item => item.task) || []

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 italic-selection">
      {/* Recruiter Banner */}
      <div className="bg-slate-900 py-3 px-6 sticky top-0 z-[100] border-b border-slate-800">
        <div className="max-w-5xl mx-auto flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-400" />
            <span className="text-xs font-bold tracking-widest uppercase">Verified Talent Profile</span>
          </div>
          <Link href="/">
             <span className="text-sm font-bold text-slate-400 hover:text-white transition-colors">SkillProof Certification System</span>
          </Link>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Sidebar / Profile Info */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
               <div className="h-3 bg-blue-600" />
               <CardContent className="pt-8 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-slate-100 text-3xl font-extrabold text-slate-400 mb-6 border-2 border-slate-50 shadow-inner">
                    {profile.full_name?.[0].toUpperCase()}
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight mb-1">{profile.full_name}</h1>
                  <p className="text-blue-600 text-sm font-bold uppercase tracking-wider mb-6">Candidate Developer</p>
                  
                  <div className="flex justify-center gap-4 mb-8">
                     {profile.github_url && (
                        <a href={profile.github_url} target="_blank" className="p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all border border-slate-200 group">
                           <Github className="w-5 h-5 text-slate-600 group-hover:text-black" />
                        </a>
                     )}
                     {profile.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" className="p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all border border-slate-200 group">
                           <Linkedin className="w-5 h-5 text-slate-600 group-hover:text-blue-700" />
                        </a>
                     )}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-100">
                     <div className="flex justify-between items-center bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Verified Credentials</span>
                        <span className="text-blue-700 font-black">{portfolio.length}</span>
                     </div>
                     <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200/50">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Credibility Score</span>
                        <span className="text-slate-900 font-black">{profile.credibility_score || 0}</span>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="space-y-3">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl">
                 Contact Candidate
              </Button>
              <Button variant="outline" className="w-full border-slate-200 font-bold h-12 rounded-xl text-slate-600">
                 Request Verified CV
              </Button>
            </div>
          </div>

          {/* Main Transcript Content */}
          <div className="lg:col-span-8 space-y-10">
            {githubStats && (
               <section>
                  <div className="flex items-center gap-2 mb-6 text-slate-500">
                     <Github className="w-4 h-4" />
                     <h2 className="text-xs font-black uppercase tracking-[0.2em]">GitHub Developer Audit</h2>
                  </div>
                  <Card className="border-none shadow-md overflow-hidden border-l-4 border-slate-900">
                     <CardContent className="p-0">
                        <div className="grid grid-cols-3 divide-x divide-slate-100">
                           <div className="p-6 text-center">
                              <p className="text-2xl font-black text-slate-900">{githubStats.publicRepos}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repositories</p>
                           </div>
                           <div className="p-6 text-center">
                              <p className="text-2xl font-black text-slate-900">{githubStats.totalStars}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stars Earned</p>
                           </div>
                           <div className="p-6 text-center">
                              <p className="text-2xl font-black text-slate-900">{githubStats.followers}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Followers</p>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               </section>
            )}

            <section>
              <div className="flex items-center gap-2 mb-6 text-slate-500">
                 <Award className="w-4 h-4 text-orange-500" />
                 <h2 className="text-xs font-black uppercase tracking-[0.2em]">Blockchain-Verified Portfolio</h2>
              </div>

              {portfolio.length > 0 ? (
                <div className="space-y-6">
                  {portfolio.map((item: any) => (
                    <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 font-sans">
                         <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 shadow-sm">Verified Authenticity</span>
                            {(item.smart_contract_tx_hash || item.blockchain_hash) && (
                              <span className="text-[8px] font-mono text-slate-400 bg-white/50 px-1 rounded">
                                Hash: {(item.smart_contract_tx_hash || item.blockchain_hash).slice(0, 12)}...
                              </span>
                            )}
                         </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase mb-1">
                           <Code2 className="w-3 h-3" /> {item.task?.category || 'Project'}
                        </div>
                        <CardTitle className="text-xl font-bold tracking-tight text-slate-900">{item.task?.title}</CardTitle>
                        <CardDescription className="text-slate-500 line-clamp-2">
                           {item.task?.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                         <div className="bg-slate-50 rounded-lg p-5 border border-slate-100 relative mb-4">
                            <p className="text-sm text-slate-700 italic leading-relaxed">"{item.submission_text}"</p>
                         </div>
                         <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100 mt-2">
                            <div className="flex items-center gap-1.5 text-xs">
                               <CheckCircle2 className="w-4 h-4 text-green-500" />
                               <span className="text-slate-500">Verified by</span>
                               <span className="font-bold text-slate-800">{item.mentor?.full_name || 'Verified Mentor'}</span>
                               <span className="text-slate-400 text-[10px]">{item.mentor?.company_name ? `@ ${item.mentor.company_name}` : ''}</span>
                            </div>
                            <div className="flex gap-4 ml-auto">
                               {item.ipfs_hash && (
                                  <a href={`https://gateway.pinata.cloud/ipfs/${item.ipfs_hash}`} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 flex items-center gap-1 underline underline-offset-4 ring-offset-2 focus:ring-2 rounded">
                                     Proof <ExternalLink className="w-3 h-3" />
                                  </a>
                               )}
                               {(item.smart_contract_tx_hash || item.blockchain_hash) && (
                                  <a href={`https://amoy.polygonscan.com/tx/${item.smart_contract_tx_hash || item.blockchain_hash}`} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-purple-600 hover:text-purple-800 flex items-center gap-1 underline underline-offset-4 ring-offset-2 focus:ring-2 rounded">
                                     Blockchain <Globe className="w-3 h-3" />
                                  </a>
                               )}
                            </div>
                         </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-medium italic">No verified work items found for this record.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-200 bg-white mt-12">
        <div className="max-w-5xl mx-auto px-6 text-center font-bold text-slate-400 text-xs tracking-[0.3em] uppercase">
           Verified on SkillProof System • 2026
        </div>
      </footer>
    </div>
  )
}
