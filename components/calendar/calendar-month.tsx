import Link from "next/link";

type CalendarMonthProps = {
  year: number;
  month: number;
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthTitleFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});
const dayLabelFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function CalendarMonth({ year, month }: CalendarMonthProps) {
  const today = new Date();
  const todayDate = today.toLocaleDateString("en-CA");
  const days = buildCalendarDays(year, month);
  const previousMonth = getRelativeMonth(year, month, -1);
  const nextMonth = getRelativeMonth(year, month, 1);

  return (
    <section
      aria-labelledby="calendar-heading"
      className="w-full max-w-5xl rounded-lg border border-signup-card-border bg-signup-card p-4 shadow-signup-card sm:p-6 lg:p-8"
    >
      <div className="flex flex-col gap-4 border-b border-signup-divider pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-signup-primary">Calendar</p>
          <h1
            id="calendar-heading"
            className="font-serif text-3xl leading-tight font-semibold text-signup-text sm:text-4xl"
          >
            {monthTitleFormatter.format(new Date(year, month - 1, 1))}
          </h1>
        </div>

        <nav aria-label="Calendar months" className="flex gap-2">
          <Link
            href={calendarHref(previousMonth.year, previousMonth.month)}
            className="rounded-md border border-signup-input-border px-4 py-2 text-sm font-semibold text-signup-muted transition-colors hover:border-signup-primary hover:text-signup-primary focus:ring-3 focus:ring-signup-primary/25 focus:outline-none"
          >
            Previous
          </Link>
          <Link
            href={calendarHref(nextMonth.year, nextMonth.month)}
            className="rounded-md border border-signup-input-border px-4 py-2 text-sm font-semibold text-signup-muted transition-colors hover:border-signup-primary hover:text-signup-primary focus:ring-3 focus:ring-signup-primary/25 focus:outline-none"
          >
            Next
          </Link>
        </nav>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-signup-card-border bg-signup-card-border">
        {weekdays.map((weekday) => (
          <div
            key={weekday}
            className="bg-signup-background px-2 py-3 text-center text-xs font-semibold text-signup-muted"
          >
            {weekday}
          </div>
        ))}

        {days.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`blank-${index}`}
                aria-hidden="true"
                className="min-h-20 bg-signup-background sm:min-h-24"
              />
            );
          }

          const date = new Date(year, month - 1, day);
          const dateKey = date.toLocaleDateString("en-CA");
          const isToday = dateKey === todayDate;

          return (
            <Link
              key={dateKey}
              href={`/diary/${dateKey}`}
              aria-current={isToday ? "date" : undefined}
              aria-label={`${isToday ? "Today, " : ""}${dayLabelFormatter.format(date)}`}
              className="group relative flex min-h-20 flex-col bg-signup-card p-2 text-sm text-signup-text transition-colors hover:bg-signup-background focus:z-10 focus:ring-3 focus:ring-signup-primary/25 focus:outline-none sm:min-h-24 sm:p-3"
            >
              <span
                className={
                  isToday
                    ? "flex size-8 items-center justify-center rounded-full bg-signup-primary text-sm font-semibold text-signup-on-primary"
                    : "flex size-8 items-center justify-center rounded-full text-sm font-semibold text-signup-text group-hover:text-signup-primary"
                }
              >
                {day}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function buildCalendarDays(year: number, month: number): Array<number | null> {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = firstDay.getDay();
  const days: Array<number | null> = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const trailingBlanks = (7 - (days.length % 7)) % 7;

  return [...days, ...Array.from({ length: trailingBlanks }, () => null)];
}

function getRelativeMonth(year: number, month: number, offset: -1 | 1) {
  const date = new Date(year, month - 1 + offset, 1);

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
}

function calendarHref(year: number, month: number) {
  return `/calendar?year=${year}&month=${month}`;
}
