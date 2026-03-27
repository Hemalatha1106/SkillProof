import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Copy } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function VerificationPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params
  const supabase = await createClient()

  // Fetch student profile
  const { data: student } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', studentId)
    .single()

  if (!student) {
    notFound()
  }

  // Fetch only approved submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      *,
      task_id (
        id,
        title,
        description,
        difficulty_level,
        category
      )
    `)
    .eq('student_id', studentId)
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })

  if (!submissions || submissions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link href="/" className="text-slate-400 hover:text-white text-sm mb-8 block">
            ← Back to Home
          </Link>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-12 text-center">
              <p className="text-slate-300 mb-4">No verified skills found for this profile.</p>
              <Link href="/" className="text-blue-400 hover:text-blue-300">
                View SkillProof home
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="text-slate-400 hover:text-white text-sm">
              ← Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-400 text-sm font-semibold">VERIFIED PROFILE</span>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{student.full_name}</h1>
            <p className="text-slate-400">Verified Skills Portfolio</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Profile Card */}
        <Card className="bg-slate-800 border-slate-700 mb-12">
          <CardHeader>
            <CardTitle className="text-white">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Email</p>
                <p className="text-white font-mono text-sm break-all">{student.email}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Member Since</p>
                <p className="text-white">{new Date(student.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
              
              {student.github_url && (
                <div>
                  <p className="text-slate-400 text-sm mb-1">GitHub Profile</p>
                  <a href={student.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline text-sm break-all">
                    {student.github_url}
                  </a>
                </div>
              )}
              {student.linkedin_url && (
                <div>
                  <p className="text-slate-400 text-sm mb-1">LinkedIn Profile</p>
                  <a href={student.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline text-sm break-all">
                    {student.linkedin_url}
                  </a>
                </div>
              )}
              <div>
                <p className="text-slate-400 text-sm mb-1">Credibility Score</p>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-lg">{student.credibility_score || 0}</span>
                  {(student.credibility_score || 0) > 10 && (
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs">Top Rated</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verified Skills */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8">
            Verified Skills ({submissions.length})
          </h2>
          <div className="space-y-4">
            {submissions.map((submission: any) => (
              <Card key={submission.id} className="bg-slate-800 border-slate-700 hover:border-green-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        <CardTitle className="text-white">{submission.task_id?.title}</CardTitle>
                      </div>
                      <CardDescription className="text-slate-400">
                        {submission.task_id?.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        submission.task_id?.difficulty_level === 'beginner' ? 'bg-green-500/20 text-green-300' :
                        submission.task_id?.difficulty_level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {submission.task_id?.difficulty_level}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {submission.task_id?.category && (
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Category</p>
                      <p className="text-slate-200">{submission.task_id?.category}</p>
                    </div>
                  )}
                  {submission.feedback && (
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Mentor Feedback</p>
                      <div className="bg-slate-900/50 border border-slate-700 rounded p-3">
                        <p className="text-slate-200 text-sm">{submission.feedback}</p>
                      </div>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Approved On</p>
                      <p className="text-slate-200 text-sm">
                        {new Date(submission.approved_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Blockchain Hash</p>
                      <code className="text-green-400 text-xs font-mono block truncate">{submission.blockchain_hash}</code>
                    </div>
                  </div>
                  
                  {(submission.ipfs_hash || submission.smart_contract_tx_hash) && (
                    <div className="grid md:grid-cols-2 gap-4 pt-2 mt-4 border-t border-slate-700/50 pt-4">
                      {submission.ipfs_hash && (
                        <div>
                          <p className="text-slate-400 text-sm mb-1">IPFS Storage Hash</p>
                          <a href={`https://gateway.pinata.cloud/ipfs/${submission.ipfs_hash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs font-mono block truncate underline">
                            {submission.ipfs_hash}
                          </a>
                        </div>
                      )}
                      {submission.smart_contract_tx_hash && (
                        <div>
                          <p className="text-slate-400 text-sm mb-1">Polygon Amoy Tx Hash</p>
                          <a href={`https://amoy.polygonscan.com/tx/${submission.smart_contract_tx_hash}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-xs font-mono block truncate underline">
                            {submission.smart_contract_tx_hash}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Verification Info */}
        <Card className="bg-blue-900/30 border-blue-700/50 mt-12">
          <CardHeader>
            <CardTitle className="text-blue-300">About This Verification</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-200 text-sm space-y-2">
            <p>
              ✓ Each skill has been reviewed and approved by an industry mentor
            </p>
            <p>
              ✓ Blockchain hashes provide permanent verification of skills
            </p>
            <p>
              ✓ This profile can be shared with employers and peers as proof of skills
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-12 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-slate-400 text-sm">
          <p>Verified on SkillProof • Blockchain-backed skill certification</p>
        </div>
      </footer>
    </div>
  )
}
