"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ComponentProps, ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";

const unsavedChangesMessage = "You have unsaved changes. Leave anyway?";

type DiaryUnsavedChangesContextValue = {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
  confirmExit: () => boolean;
};

const DiaryUnsavedChangesContext = createContext<DiaryUnsavedChangesContextValue>({
  hasUnsavedChanges: false,
  setHasUnsavedChanges: () => {},
  confirmExit: () => true,
});

type DiaryUnsavedChangesProviderProps = {
  children: ReactNode;
};

export function DiaryUnsavedChangesProvider({ children }: DiaryUnsavedChangesProviderProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const confirmExit = useCallback(() => {
    return !hasUnsavedChanges || window.confirm(unsavedChangesMessage);
  }, [hasUnsavedChanges]);

  const value = useMemo(
    () => ({
      hasUnsavedChanges,
      setHasUnsavedChanges,
      confirmExit,
    }),
    [confirmExit, hasUnsavedChanges],
  );

  return (
    <DiaryUnsavedChangesContext.Provider value={value}>
      {children}
    </DiaryUnsavedChangesContext.Provider>
  );
}

export function useDiaryUnsavedChanges() {
  return useContext(DiaryUnsavedChangesContext);
}

type GuardedDiaryLinkProps = ComponentProps<typeof Link>;

export function GuardedDiaryLink({ onNavigate, ...props }: GuardedDiaryLinkProps) {
  const { confirmExit } = useDiaryUnsavedChanges();

  return (
    <Link
      onNavigate={(event) => {
        onNavigate?.(event);

        if (!confirmExit()) {
          event.preventDefault();
        }
      }}
      {...props}
    />
  );
}

export function GuardedDiaryLogoutButton() {
  const { confirmExit } = useDiaryUnsavedChanges();

  return <LogoutButton logoutGuard={confirmExit} />;
}
