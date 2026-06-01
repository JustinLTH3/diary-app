import { prisma } from "@/lib/db/prisma";

export async function getEntryForDate(userId: string, date: Date) {
  const entry = await prisma.diaryEntry.findUnique({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
    select: {
      content: true,
    },
  });

  return entry?.content ?? "";
}
