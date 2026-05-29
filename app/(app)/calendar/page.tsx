import { LogoutButton } from "@/components/auth/logout-button";
import { CalendarMonth } from "@/components/calendar/calendar-month";
import { requireUser } from "@/lib/auth/requireUser";

type CalendarPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps = {}) {
  await requireUser();
  const selectedMonth = getSelectedMonth(searchParams ? await searchParams : {});

  return (
    <main className="min-h-screen flex-1 bg-signup-background px-4 py-6 text-signup-text sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-4xl leading-tight font-bold text-signup-primary">Diary</p>
            <p className="mt-1 text-sm text-signup-muted">Choose a day to open your entry.</p>
          </div>
          <LogoutButton />
        </header>

        <CalendarMonth year={selectedMonth.year} month={selectedMonth.month} />
      </div>
    </main>
  );
}

function getSelectedMonth(searchParams: Record<string, string | string[] | undefined>) {
  const currentMonth = getCurrentMonth();
  const year = getSingleParam(searchParams.year);
  const month = getSingleParam(searchParams.month);

  if (!year || !month || !/^\d{4}$/.test(year) || !/^\d{1,2}$/.test(month)) {
    return currentMonth;
  }

  const parsedYear = Number(year);
  const parsedMonth = Number(month);

  if (
    !Number.isInteger(parsedYear) ||
    !Number.isInteger(parsedMonth) ||
    parsedYear < 1000 ||
    parsedYear > 9999 ||
    parsedMonth < 1 ||
    parsedMonth > 12
  ) {
    return currentMonth;
  }

  return {
    year: parsedYear,
    month: parsedMonth,
  };
}

function getCurrentMonth() {
  const today = new Date();

  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  };
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
