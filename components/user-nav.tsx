'use client'

import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Settings, LogOut, User, LayoutDashboard } from 'lucide-react'

interface UserNavProps {
  user: {
    email?: string
    id: string
  }
  profile: {
    full_name?: string
    role?: string
    company_name?: string
    position?: string
    github_url?: string
    credibility_score?: number
  }
}

export function UserNav({ user, profile }: UserNavProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user.email?.[0].toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border border-slate-200 shadow-sm transition-hover hover:border-blue-400">
            <AvatarImage src="" alt={profile?.full_name || 'User avatar'} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-semibold leading-none text-slate-900">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs leading-none text-slate-500">
              {user.email}
            </p>
            <div className="mt-2 pt-2 border-t border-slate-100 italic">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                {profile?.role || 'User'} Profile
              </span>
              {profile?.role === 'mentor' && profile?.company_name && (
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {profile.company_name} • {profile.position}
                </p>
              )}
              {profile?.role === 'student' && (
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Score: {profile.credibility_score || 0}
                </p>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push(`/${profile?.role}`)}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-700 focus:bg-red-50">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
