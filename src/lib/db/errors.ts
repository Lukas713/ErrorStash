import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export type ErrorEntryWithTags = {
  id: string
  title: string
  description: string | null
  stackTrace: string | null
  solution: string | null
  status: 'SOLVED' | 'UNSOLVED'
  isPublic: boolean
  isFavorite: boolean
  isPinned: boolean
  createdAt: string
  tags: { id: string; name: string }[]
}

export type DashboardUser = {
  id: string
  name: string | null
  email: string
  image: string | null
  isPro: boolean
}

export async function getErrorEntries(): Promise<ErrorEntryWithTags[]> {
  const entries = await prisma.errorEntry.findMany({
    include: {
      tags: {
        include: { tag: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return entries.map(entry => ({
    id: entry.id,
    title: entry.title,
    description: entry.description,
    stackTrace: entry.stackTrace,
    solution: entry.solution,
    status: entry.status,
    isPublic: entry.isPublic,
    isFavorite: entry.isFavorite,
    isPinned: entry.isPinned,
    createdAt: entry.createdAt.toISOString(),
    tags: entry.tags.map(et => ({ id: et.tag.id, name: et.tag.name })),
  }))
}

export async function createErrorEntry(input: {
  userId: string
  title: string
  status: 'SOLVED' | 'UNSOLVED'
  isPublic?: boolean
  description?: string | null
  stackTrace?: string | null
  solution?: string | null
  tags: string[]
}): Promise<ErrorEntryWithTags> {
  const { userId, title, status, isPublic = false, description, stackTrace, solution, tags } = input

  const tagRecords = tags.length > 0
    ? await Promise.all(
        tags.map(name =>
          prisma.tag.upsert({
            where: { name_userId: { name, userId } },
            update: {},
            create: { name, userId },
          })
        )
      )
    : []

  const entry = await prisma.errorEntry.create({
    data: {
      userId,
      title,
      status,
      isPublic,
      description: description ?? null,
      stackTrace: stackTrace ?? null,
      solution: solution ?? null,
      tags: {
        create: tagRecords.map(tag => ({ tagId: tag.id })),
      },
    },
    include: {
      tags: { include: { tag: true } },
    },
  })

  return {
    id: entry.id,
    title: entry.title,
    description: entry.description,
    stackTrace: entry.stackTrace,
    solution: entry.solution,
    status: entry.status,
    isPublic: entry.isPublic,
    isFavorite: entry.isFavorite,
    isPinned: entry.isPinned,
    createdAt: entry.createdAt.toISOString(),
    tags: entry.tags.map(et => ({ id: et.tag.id, name: et.tag.name })),
  }
}

export async function getCurrentUser(): Promise<DashboardUser | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, isPro: true },
  })
  return user
}
