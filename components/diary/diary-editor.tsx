"use client";

import { useMemo, useState } from "react";

type DiaryEditorProps = {
  date: string;
  initialContent?: string;
};

const characterLimit = 10000;

export function DiaryEditor({ date, initialContent = "" }: DiaryEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [lastSavedContent] = useState(initialContent);
  const hasUnsavedChanges = content !== lastSavedContent;
  const remainingCharacters = characterLimit - content.length;
  const status = hasUnsavedChanges ? "Unsaved changes" : "Ready";

  const wordCount = useMemo(() => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return 0;
    }

    return trimmedContent.split(/\s+/).length;
  }, [content]);

  return (
    <section className="flex min-h-[70vh] flex-col rounded-lg border border-signup-card-border bg-signup-card shadow-signup-card">
      <div className="flex flex-col gap-3 border-b border-signup-divider px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-semibold tracking-wide text-signup-primary uppercase">
            Diary Entry
          </p>
          <h1 className="font-serif text-2xl leading-tight font-semibold text-signup-text sm:text-3xl">
            {formatDiaryDate(date)}
          </h1>
        </div>

        <p
          aria-live="polite"
          className="rounded-md border border-signup-input-border px-3 py-2 text-sm font-medium text-signup-muted"
        >
          {status}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <label htmlFor="diary-content" className="sr-only">
          Diary entry
        </label>
        <textarea
          id="diary-content"
          name="content"
          value={content}
          maxLength={characterLimit}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Start writing..."
          className="min-h-[50vh] flex-1 resize-none border-0 bg-transparent text-base leading-8 text-signup-text outline-none placeholder:text-signup-placeholder focus:ring-0"
        />
      </div>

      <footer className="flex flex-col gap-2 border-t border-signup-divider px-4 py-3 text-xs text-signup-status sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{wordCount} words</p>
        <p>{remainingCharacters.toLocaleString("en-US")} characters remaining</p>
      </footer>
    </section>
  );
}

function formatDiaryDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}
