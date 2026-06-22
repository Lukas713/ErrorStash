import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export type ProfileData = {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    isPro: boolean
    createdAt: string
    hasPassword: boolean
  }
  stats: {
    totalEntries: number
    solvedEntries: number
    unsolvedEntries: number
    totalTags: number
  }
}

export async function getProfileData(): Promise<ProfileData | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const [user, totalEntries, solvedEntries, totalTags] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isPro: true,
        createdAt: true,
        password: true,
      },
    }),
    prisma.errorEntry.count({ where: { userId: session.user.id } }),
    prisma.errorEntry.count({ where: { userId: session.user.id, status: 'SOLVED' } }),
    prisma.tag.count({ where: { userId: session.user.id } }),
  ])

  if (!user) return null

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      isPro: user.isPro,
      createdAt: user.createdAt.toISOString(),
      hasPassword: user.password !== null,
    },
    stats: {
      totalEntries,
      solvedEntries,
      unsolvedEntries: totalEntries - solvedEntries,
      totalTags,
    },
  }
}
