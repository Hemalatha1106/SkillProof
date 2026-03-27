'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link2, Check, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface InviteLinkProps {
  mentorId: string
  inviteCode?: string
  title?: string
}

export function InviteLink({ mentorId, inviteCode, title }: InviteLinkProps) {
  const [copied, setCopied] = useState(false)
  
  const inviteUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/invite/${inviteCode || mentorId}` 
    : `https://skillproof.com/invite/${inviteCode || mentorId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <Card className={`${title ? 'mb-4' : 'mb-12'} border-blue-200 bg-blue-50/50 shadow-sm shadow-blue-50/50`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-blue-800">
          <Link2 className="w-5 h-5" />
          <CardTitle className="text-lg">{title || 'Your Invite Link'}</CardTitle>
        </div>
        <CardDescription className="text-blue-700/80">
          {title ? 'Share this room with your students.' : 'Share this link with your students to add them to your mentorship program.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 bg-white border border-blue-200 rounded px-3 py-2 text-sm font-mono text-blue-900 truncate">
            {inviteUrl}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white border-blue-200 text-blue-700 hover:bg-blue-100 min-w-[100px] h-9"
            onClick={copyToClipboard}
          >
            {copied ? (
              <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Copied</span>
            ) : (
              <span className="flex items-center gap-1"><Copy className="w-4 h-4" /> Copy Link</span>
            )}
          </Button>
        </div>
        {inviteCode && (
          <div className="flex items-center gap-2 text-xs text-blue-600/70 font-medium">
             <span>Invite Code: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-100">{inviteCode}</code></span>
             <button 
               onClick={() => {
                 navigator.clipboard.writeText(inviteCode);
                 toast.success('Code copied!');
               }}
               className="hover:text-blue-800 underline underline-offset-2"
             >
               Copy Code
             </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
