'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createErrorEntry, updateErrorEntry, type ErrorEntryDetail } from '@/lib/db/errors'

const createErrorSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  status: z.enum(['SOLVED', 'UNSOLVED']).default('UNSOLVED'),
  isPublic: z.boolean().default(false),
  description: z.string().optional(),
  stackTrace: z.string().optional(),
  solution: z.string().optional(),
  tags: z.string().optional(),
})

const updateErrorSchema = createErrorSchema.extend({
  id: z.string().min(1),
})

function parseTags(tags?: string): string[] {
  return tags
    ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
    : []
}

export async function createErrorAction(
  formData: FormData
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  const result = createErrorSchema.safeParse({
    title: formData.get('title'),
    status: formData.get('status') || 'UNSOLVED',
    isPublic: formData.get('isPublic') === 'true',
    description: formData.get('description') || undefined,
    stackTrace: formData.get('stackTrace') || undefined,
    solution: formData.get('solution') || undefined,
    tags: formData.get('tags') || undefined,
  })

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { title, status, isPublic, description, stackTrace, solution, tags } = result.data

  await createErrorEntry({
    userId: session.user.id,
    title,
    status,
    isPublic,
    description,
    stackTrace,
    solution,
    tags: parseTags(tags),
  })

  return {}
}

export async function updateErrorAction(
  formData: FormData
): Promise<{ error?: string; entry?: ErrorEntryDetail }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  const result = updateErrorSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    status: formData.get('status') || 'UNSOLVED',
    isPublic: formData.get('isPublic') === 'true',
    description: formData.get('description') || undefined,
    stackTrace: formData.get('stackTrace') || undefined,
    solution: formData.get('solution') || undefined,
    tags: formData.get('tags') || undefined,
  })

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { id, title, status, isPublic, description, stackTrace, solution, tags } = result.data

  // Owner check — only the entry's owner may edit it.
  const existing = await prisma.errorEntry.findUnique({
    where: { id },
    select: { userId: true },
  })
  if (!existing || existing.userId !== session.user.id) {
    return { error: 'Not found' }
  }

  const entry = await updateErrorEntry({
    id,
    userId: session.user.id,
    title,
    status,
    isPublic,
    description,
    stackTrace,
    solution,
    tags: parseTags(tags),
  })

  return { entry }
}
