import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle, Shield, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="text-2xl font-bold text-white">SkillProof</div>
        <div className="flex gap-6 items-center">
          <Link href="/auth/login" className="text-slate-300 hover:text-white text-sm">
            Sign In
          </Link>
          <Link href="/auth/sign-up">
            <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 md:px-12 md:py-32">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Verify Your Skills with Blockchain-Backed Certificates
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl">
            SkillProof connects students and mentors to create verified, tamper-proof skill certifications. Submit your work, get mentored, and receive blockchain-verified credentials.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/auth/sign-up">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                Start as Student
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button variant="outline" className="px-8 py-6 text-lg border-slate-500 text-white hover:bg-slate-700">
                Join as Mentor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-20 border-t border-slate-700">
        <h2 className="text-4xl font-bold text-white mb-16 text-center">Why SkillProof?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
            <Shield className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Blockchain Verified</h3>
            <p className="text-slate-300">Every approved skill gets a unique blockchain hash for permanent verification.</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Mentor Approved</h3>
            <p className="text-slate-300">Industry experts review and approve your submissions for authentic skill validation.</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
            <Zap className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Publicly Shareable</h3>
            <p className="text-slate-300">Share your verified skills with employers and peers using unique verification links.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-12 py-20 border-t border-slate-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Prove Your Skills?</h2>
          <p className="text-xl text-slate-300 mb-8">Join thousands of students and mentors building verifiable skill portfolios.</p>
          <Link href="/auth/sign-up">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
              Create Your Account Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 px-6 md:px-12 py-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center text-slate-400 text-sm">
          <p>&copy; 2025 SkillProof. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
