import { prisma } from '@/lib/prisma'

export type TagWithCount = {
  id: string
  name: string
  count: number
}

export async function getTagsWithCounts(userId: string, isPro: boolean): Promise<TagWithCount[]> {
  if (isPro) {
    const tags = await prisma.tag.findMany({
      include: {
        entries: { select: { errorEntryId: true } },
      },
    })

    const grouped = tags.reduce<Record<string, TagWithCount>>((acc, tag) => {
      if (acc[tag.name]) {
        acc[tag.name].count += tag.entries.length
      } else {
        acc[tag.name] = { id: tag.id, name: tag.name, count: tag.entries.length }
      }
      return acc
    }, {})

    return Object.values(grouped)
      .filter(t => t.count > 0)
      .sort((a, b) => b.count - a.count)
  }

  const tags = await prisma.tag.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      _count: { select: { entries: true } },
    },
  })

  return tags
    .map(tag => ({ id: tag.id, name: tag.name, count: tag._count.entries }))
    .filter(t => t.count > 0)
    .sort((a, b) => b.count - a.count)
}
