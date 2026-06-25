import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the auth, db, and prisma modules so the action runs in isolation —
// no real session, database, or Neon connection is touched. vi.mock factories
// are hoisted above imports, so the spies are created with vi.hoisted.
const { auth, createErrorEntry, updateErrorEntry, findUnique } = vi.hoisted(() => ({
  auth: vi.fn(),
  createErrorEntry: vi.fn(),
  updateErrorEntry: vi.fn(),
  findUnique: vi.fn(),
}))

vi.mock('@/auth', () => ({ auth }))
vi.mock('@/lib/db/errors', () => ({ createErrorEntry, updateErrorEntry }))
vi.mock('@/lib/prisma', () => ({ prisma: { errorEntry: { findUnique } } }))

import { createErrorAction, updateErrorAction } from './errors'

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) fd.set(key, value)
  return fd
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createErrorAction', () => {
  it('returns Unauthorized when there is no session', async () => {
    auth.mockResolvedValue(null)

    const result = await createErrorAction(formData({ title: 'Boom' }))

    expect(result).toEqual({ error: 'Unauthorized' })
    expect(createErrorEntry).not.toHaveBeenCalled()
  })

  it('returns a validation error when the title is missing', async () => {
    auth.mockResolvedValue({ user: { id: 'user-1' } })

    const result = await createErrorAction(formData({ title: '' }))

    expect(result.error).toBe('Title is required')
    expect(createErrorEntry).not.toHaveBeenCalled()
  })

  it('creates the entry with parsed tags on success', async () => {
    auth.mockResolvedValue({ user: { id: 'user-1' } })
    createErrorEntry.mockResolvedValue({ id: 'entry-1' })

    const result = await createErrorAction(
      formData({
        title: 'TypeError: undefined',
        status: 'SOLVED',
        isPublic: 'true',
        tags: 'React, , hooks ,REACT',
      }),
    )

    expect(result).toEqual({})
    expect(createErrorEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        title: 'TypeError: undefined',
        status: 'SOLVED',
        isPublic: true,
        // trimmed, lowercased, empties dropped (duplicates are kept as-is)
        tags: ['react', 'hooks', 'react'],
      }),
    )
  })
})

describe('updateErrorAction', () => {
  it('returns "Not found" when the caller does not own the entry', async () => {
    auth.mockResolvedValue({ user: { id: 'user-1' } })
    findUnique.mockResolvedValue({ userId: 'someone-else' })

    const result = await updateErrorAction(
      formData({ id: 'entry-1', title: 'Edited' }),
    )

    expect(result).toEqual({ error: 'Not found' })
    expect(updateErrorEntry).not.toHaveBeenCalled()
  })

  it('updates and returns the entry for the owner', async () => {
    auth.mockResolvedValue({ user: { id: 'user-1' } })
    findUnique.mockResolvedValue({ userId: 'user-1' })
    updateErrorEntry.mockResolvedValue({ id: 'entry-1', title: 'Edited' })

    const result = await updateErrorAction(
      formData({ id: 'entry-1', title: 'Edited' }),
    )

    expect(result.entry).toEqual({ id: 'entry-1', title: 'Edited' })
    expect(updateErrorEntry).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'entry-1', userId: 'user-1', title: 'Edited' }),
    )
  })
})
