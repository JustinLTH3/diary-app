"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { diaryContentMaxLength } from "@/lib/validation/diary";

type DiaryEditorProps = {
  date: string;
  initialContent?: string;
};

type SaveStatus = "ready" | "unsaved" | "saving" | "saved" | "error";

const statusLabels: Record<SaveStatus, string> = {
  ready: "Ready",
  unsaved: "Unsaved changes",
  saving: "Saving...",
  saved: "Saved",
  error: "Unable to save",
};

export function DiaryEditor({ date, initialContent = "" }: DiaryEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("ready");
  const contentRef = useRef(initialContent);
  const lastSavedContentRef = useRef(initialContent);
  const saveRequestIdRef = useRef(0);
  const remainingCharacters = diaryContentMaxLength - content.length;

  useEffect(() => {
    setContent(initialContent);
    setSaveStatus("ready");
    contentRef.current = initialContent;
    lastSavedContentRef.current = initialContent;
    saveRequestIdRef.current += 1;
  }, [date, initialContent]);

  const saveContent = useCallback(
    async (nextContent: string) => {
      if (nextContent === lastSavedContentRef.current) {
        setSaveStatus("ready");
        return;
      }

      const requestId = saveRequestIdRef.current + 1;
      saveRequestIdRef.current = requestId;
      setSaveStatus("saving");

      try {
        const response = await fetch("/api/diary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date,
            content: nextContent,
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to save diary entry.");
        }

        await response.json();

        if (saveRequestIdRef.current !== requestId) {
          return;
        }

        lastSavedContentRef.current = nextContent;
        setSaveStatus(contentRef.current === nextContent ? "saved" : "unsaved");
      } catch {
        if (saveRequestIdRef.current === requestId) {
          setSaveStatus("error");
        }
      }
    },
    [date],
  );

  useEffect(() => {
    if (content === lastSavedContentRef.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void saveContent(content);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [content, saveContent]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      const latestContent = contentRef.current;

      if (latestContent === lastSavedContentRef.current) {
        return;
      }

      sendFinalSave(date, latestContent);
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [date]);

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
          {statusLabels[saveStatus]}
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
          maxLength={diaryContentMaxLength}
          onChange={(event) => {
            const nextContent = event.target.value;

            setContent(nextContent);
            contentRef.current = nextContent;
            setSaveStatus(nextContent === lastSavedContentRef.current ? "ready" : "unsaved");
          }}
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

function sendFinalSave(date: string, content: string) {
  const body = JSON.stringify({ date, content });

  if (navigator.sendBeacon) {
    const payload = new Blob([body], { type: "application/json" });

    if (navigator.sendBeacon("/api/diary", payload)) {
      return;
    }
  }

  void fetch("/api/diary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  });
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
