import { prisma } from "@/lib/db/prisma";

export async function listEntryDatesForMonth(userId: string, year: number, month: number) {
  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const nextMonthStart = new Date(Date.UTC(year, month, 1));
  const entries = await prisma.diaryEntry.findMany({
    where: {
      userId,
      content: {
        not: "",
      },
      date: {
        gte: monthStart,
        lt: nextMonthStart,
      },
    },
    select: {
      date: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  return entries.map((entry) => entry.date.toLocaleDateString("en-CA"));
}
