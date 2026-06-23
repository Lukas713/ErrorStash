'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { createErrorEntry } from '@/lib/db/errors'

const createErrorSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  status: z.enum(['SOLVED', 'UNSOLVED']).default('UNSOLVED'),
  isPublic: z.boolean().default(false),
  description: z.string().optional(),
  stackTrace: z.string().optional(),
  solution: z.string().optional(),
  tags: z.string().optional(),
})

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
  const tagList = tags
    ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
    : []

  await createErrorEntry({
    userId: session.user.id,
    title,
    status,
    isPublic,
    description,
    stackTrace,
    solution,
    tags: tagList,
  })

  return {}
}
