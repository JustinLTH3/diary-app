import { prisma } from "@/lib/db/prisma";

export async function saveEntryContent(userId: string, date: Date, content: string) {
  return prisma.diaryEntry.upsert({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
    create: {
      userId,
      date,
      content,
    },
    update: {
      content,
    },
    select: {
      date: true,
      content: true,
      updatedAt: true,
    },
  });
}
