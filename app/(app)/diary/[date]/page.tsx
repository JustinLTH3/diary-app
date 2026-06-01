import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { DiaryEditor } from "@/components/diary/diary-editor";
import { requireUser } from "@/lib/auth/requireUser";
import { parseDiaryDate } from "@/lib/dates/parseDiaryDate";

type DiaryPageProps = {
  params: Promise<{
    date: string;
  }>;
};

export const metadata: Metadata = {
  title: "Edit diary entry | Diary",
  description: "Edit a diary entry.",
};

export default async function DiaryPage({ params }: DiaryPageProps) {
  await requireUser();

  const { date } = await params;
  const parsedDate = parseDiaryDate(date);

  if (!parsedDate) {
    notFound();
  }

  const calendarHref = `/calendar?year=${parsedDate.getUTCFullYear()}&month=${
    parsedDate.getUTCMonth() + 1
  }`;

  return (
    <main className="min-h-screen flex-1 bg-signup-background px-4 py-6 text-signup-text sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={calendarHref}
            className="inline-flex w-fit rounded-md border border-signup-input-border px-4 py-2 text-sm font-semibold text-signup-muted transition-colors hover:border-signup-primary hover:text-signup-primary focus:ring-3 focus:ring-signup-primary/25 focus:outline-none"
          >
            Back to calendar
          </Link>
          <LogoutButton />
        </header>

        <DiaryEditor date={date} />
      </div>
    </main>
  );
}
