import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getErrorEntryById } from '@/lib/db/errors'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const entry = await getErrorEntryById(id)
  if (!entry) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Visibility: owners always see their own entry; other users may only view it
  // if it is public AND the viewer is Pro (community access).
  if (entry.userId !== session.user.id) {
    if (!entry.isPublic) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const viewer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPro: true },
    })
    if (!viewer?.isPro) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }

  return NextResponse.json(entry)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.errorEntry.findUnique({ where: { id }, select: { userId: true } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body: { isFavorite?: boolean; isPinned?: boolean; isPublic?: boolean } = await req.json()
  await prisma.errorEntry.update({
    where: { id },
    data: {
      ...(body.isFavorite !== undefined && { isFavorite: body.isFavorite }),
      ...(body.isPinned !== undefined && { isPinned: body.isPinned }),
      ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
    },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.errorEntry.findUnique({ where: { id }, select: { userId: true } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.errorEntry.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
