import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DiaryEditor } from "@/components/diary/diary-editor";
import {
  DiaryUnsavedChangesProvider,
  GuardedDiaryLink,
  GuardedDiaryLogoutButton,
} from "@/components/diary/diary-unsaved-changes";
import { requireUser } from "@/lib/auth/requireUser";
import { parseDiaryDate } from "@/lib/dates/parseDiaryDate";
import { getEntryForDate } from "@/lib/diary/getEntryForDate";

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
  const user = await requireUser();

  const { date } = await params;
  const parsedDate = parseDiaryDate(date);

  if (!parsedDate) {
    notFound();
  }

  const calendarHref = `/calendar?year=${parsedDate.getUTCFullYear()}&month=${
    parsedDate.getUTCMonth() + 1
  }`;
  const initialContent = await getEntryForDate(user.id, parsedDate);

  return (
    <main className="min-h-screen flex-1 bg-signup-background px-4 py-6 text-signup-text sm:px-6 lg:px-8">
      <DiaryUnsavedChangesProvider>
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <header className="flex min-h-[4.5rem] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <GuardedDiaryLink
              href={calendarHref}
              className="inline-flex w-fit rounded-md border border-signup-input-border px-4 py-2 text-sm font-semibold text-signup-muted transition-colors hover:border-signup-primary hover:text-signup-primary focus:ring-3 focus:ring-signup-primary/25 focus:outline-none"
            >
              Back to calendar
            </GuardedDiaryLink>
            <GuardedDiaryLogoutButton />
          </header>

          <DiaryEditor key={date} date={date} initialContent={initialContent} />
        </div>
      </DiaryUnsavedChangesProvider>
    </main>
  );
}
