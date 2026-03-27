/**
 * GitHub API Service
 * Fetches user profile, repository statistics, and activity from the GitHub API.
 */

export interface GitHubStats {
  username: string
  avatarUrl: string
  publicRepos: number
  followers: number
  following: number
  bio: string
  location: string
  company: string
  blog: string
  createdAt: string
  totalStars: number
}

export interface GitHubActivity {
  id: string
  type: string
  repo: string
  repoUrl: string
  createdAt: string
  payload?: any
}

export interface GitHubRepo {
  id: number
  name: string
  description: string
  url: string
  stars: number
  language: string
  updatedAt: string
}

export async function getGitHubStats(username: string): Promise<GitHubStats | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        // 'Authorization': `token ${process.env.GITHUB_TOKEN}` // Optional: if provided
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!res.ok) return null

    const data = await res.json()
    
    // Fetch repos for stars calculation
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
       headers: { Accept: 'application/vnd.github.v3+json' },
       next: { revalidate: 3600 }
    })
    
    const repos = reposRes.ok ? await reposRes.json() : []
    const totalStars = (repos as any[]).reduce((acc, repo) => acc + repo.stargazers_count, 0)

    return {
      username: data.login,
      avatarUrl: data.avatar_url,
      publicRepos: data.public_repos,
      followers: data.followers,
      following: data.following,
      bio: data.bio,
      location: data.location,
      company: data.company,
      blog: data.blog,
      createdAt: data.created_at,
      totalStars
    }
  } catch (error) {
    console.error('Error fetching GitHub stats:', error)
    return null
  }
}

export async function getGitHubActivity(username: string): Promise<GitHubActivity[]> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=10`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 600 } // Cache for 10 minutes
    })

    if (!res.ok) return []

    const data = await res.json()
    return (data as any[]).map(event => ({
      id: event.id,
      type: event.type,
      repo: event.repo.name,
      repoUrl: `https://github.com/${event.repo.name}`,
      createdAt: event.created_at,
      payload: event.payload
    }))
  } catch (error) {
    console.error('Error fetching GitHub activity:', error)
    return []
  }
}

export async function getGitHubRepos(username: string): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 3600 }
    })

    if (!res.ok) return []

    const data = await res.json()
    return (data as any[]).map(repo => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language,
      updatedAt: repo.updated_at
    }))
  } catch (error) {
    console.error('Error fetching GitHub repos:', error)
    return []
  }
}

export function extractUsername(url: string): string | null {
  if (!url) return null
  try {
    // Regex to handle various github url formats
    const match = url.match(/github\.com\/([^/]+)/)
    return match ? match[1].replace(/\/$/, '') : null
  } catch {
    return null
  }
}
