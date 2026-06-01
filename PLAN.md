# Full Stack Diary App Plan

## Current Status

- Base app, tooling, Prisma 7/PostgreSQL schema, initial migration, Auth.js Credentials configuration, auth helpers, signup route, signup page, signin page, server-side `requireUser()` helper, and protected `/calendar` page are implemented.
- Signup posts to `POST /api/auth/signup`, attempts automatic Auth.js signin after successful signup, and redirects to `/calendar`.
- Signin is functional through Auth.js, redirects authenticated users away from `/signin`, and sends successful signins to `/calendar`.
- `/calendar` is protected with `requireUser()` and renders a real month calendar with month navigation, day links to `/diary/YYYY-MM-DD`, today styling, and logout. The protected `/diary/[date]` page validates the route date, loads saved content for the authenticated user, and auto-saves edits through `POST /api/diary`.
- Tests cover auth validation, date route validation/parsing, diary validation, password hashing, user auth helpers, diary database helpers, Auth.js callbacks/provider behavior, signup route/form states including automatic signin and redirect, signin flow states, `requireUser()`, the diary save route, the protected calendar page, and diary editor auto-save states. E2E coverage is still limited to smoke/signup rendering.

## Known Gaps

- Future protected app pages still need to call `requireUser()` close to their server-side page/data loading.
- Calendar diary-entry markers have not been built.
- `listEntryDatesForMonth` has not been implemented.
- Full signup-signin-calendar-diary E2E coverage has not been implemented.

## Stack

- Frontend: Next.js App Router, React 19, TypeScript.
- Backend: Next.js Route Handlers and server components where appropriate.
- Database: PostgreSQL.
- ORM: Prisma 7.
- Password hashing: Argon2.
- Authentication: Auth.js with the Credentials provider and JWT session strategy.
- Validation: Zod.
- Testing: Vitest, React Testing Library, and Playwright.
- Styling: Tailwind CSS 4 with shared theme tokens in `app/globals.css`.

## App Structure

```txt
app/
  (auth)/
    signin/
      page.tsx
    signup/
      page.tsx
  (app)/
    calendar/
      page.tsx                      # protected month calendar screen
    diary/
      [date]/
        page.tsx
  api/
    auth/
      [...nextauth]/
        route.ts
      signup/
        route.ts
    diary/
      route.ts
      dates/
        route.ts                    # pending
components/
  auth/
    logout-button.tsx
    signin-form.tsx
    signup-form.tsx
  calendar/
    calendar-month.tsx
  diary/
lib/
  auth/
    createUser.ts
    hashPassword.ts
    requireUser.ts
    verifyCredentials.ts
    verifyPassword.ts
  db/
    prisma.ts
  diary/
    getEntryForDate.ts
    saveEntryContent.ts
    listEntryDatesForMonth.ts       # pending
  dates/
    parseDiaryDate.ts
  validation/
    auth.ts
    diary.ts
    date.ts
prisma/
tests/
types/
  next-auth.d.ts
auth.ts
```

## Data Model

```prisma
model User {
  id           String       @id @default(cuid())
  email        String       @unique
  passwordHash String
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  entries      DiaryEntry[]
}

model DiaryEntry {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime @db.Date
  content   String   @default("")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
}
```

Rules:

- One diary entry per user per date.
- The unique key is `userId + date`.
- Store diary dates as PostgreSQL `DATE` values mapped from `YYYY-MM-DD` routes.
- Only `content` is editable by the user.

## Authentication

Signup:

- Normalize email.
- Validate email and password.
- Hash password with Argon2.
- Create user through `createUser`.
- Return `201` with the created user on success.
- Return `400` for invalid payloads.
- Return `409` for duplicate emails.
- Frontend posts credentials to `POST /api/auth/signup`.
- Frontend currently attempts automatic Auth.js signin after successful signup and redirects to `/calendar` if signin succeeds.

Signin:

- Normalize email.
- Use the Auth.js Credentials provider.
- Fetch user by email inside `verifyCredentials`.
- Verify password with Argon2.
- Return `null` for invalid, missing, or malformed credentials.
- Use JWT sessions.
- Expose the authenticated user's id on `session.user.id`.
- Redirect already-authenticated users away from `/signin` to `/calendar`.
- Functional frontend signin is implemented and redirects successful signins to `/calendar`.

Route protection:

- `requireUser()` is implemented for server-side page/data access checks.
- Protected pages should call `requireUser()` close to their server-side page/data loading.
- Missing sessions redirect to `/signin`.
- Server-side diary operations should extract `userId` from the session and scope every query with it.

## Pages

### Signup Page

- Implemented at `/signup`.
- Renders email and password fields.
- Posts to `POST /api/auth/signup`.
- Shows pending, success, duplicate-email, invalid-credentials, and generic error states.
- Current working tree attempts automatic signin after account creation and redirects to `/calendar`.

### Signin Page

- Implemented at `/signin`.
- Redirects authenticated users to `/calendar`.
- Renders email and password fields.
- Submits through Auth.js credentials signin.
- Shows pending, invalid-credentials, and generic error states.
- Redirects successful signins to `/calendar`.

### Calendar Page

- Implemented at `/calendar`.
- Requires authentication through `requireUser()`.
- Defaults to the current local month when query params are missing or invalid.
- Supports `?year=YYYY&month=M`.
- Renders month navigation, weekday labels, a full month grid, day links, today styling, and logout.

Implemented behavior:

- Require authentication.
- Show a month calendar.
- Let the user select a date.
- Clicking a day routes to `/diary/YYYY-MM-DD`.

Pending behavior:

- Mark days that already have diary content.
- Diary-entry dates should be fetched in the protected server calendar flow after `requireUser()` resolves the user, once `listEntryDatesForMonth` exists. They should not be passed as a public prop to the calendar component.

### Diary Page

Route: `/diary/[date]`

- Frontend implemented.

Implemented behavior:

- Require authentication.
- Validate the route date.
- Render a diary editor for the selected date.
- Load the authenticated user's diary content for the selected date.
- Auto-save content after edits.
- Show save state: saving, saved, or error.
- Create the entry on first auto-save if none exists.
- Show writing counts.

## Auto-Save Behavior

- Implemented through `components/diary/diary-editor.tsx` and `POST /api/diary`.
- The editor keeps local content state.
- Changes trigger a debounced save after 1 second of no editing.
- Auto-save only runs if content changed since the last successful save.
- Save requests are idempotent through an upsert by `userId + date`.
- Failed saves show a non-blocking error state and retry on the next edit.
- Unchanged content is not saved.
- Closing or leaving the page triggers a best-effort final save attempt when there are unsaved changes and asks the browser to show an unsaved-changes confirmation prompt.

## Server Logic

Implemented:

- `createUser(email, password)`
- `verifyCredentials(email, password)`
- `hashPassword(password)`
- `verifyPassword(hash, password)`
- `requireUser()`
- `parseDiaryDate(value)`
- `getEntryForDate(userId, date)`
- `saveEntryContent(userId, date, content)`
- `POST /api/diary`
- Protected calendar month rendering and navigation.

Pending:

- `listEntryDatesForMonth(userId, year, month)`

Note: shared date-to-string formatting is intentionally not planned. UI display formatting should stay local to components, such as the existing `Intl.DateTimeFormat` usage in `CalendarMonth`.

## Validation

Implemented:

- Email format.
- Email trimming and lowercasing.
- Password minimum length.
- Date route format: `YYYY-MM-DD`.
- Diary content maximum length.

Pending:

- Month/year query validation for calendar entry markers.

## Testing Plan

Implemented:

- Starter page smoke tests.
- Signup page rendering, API-state, automatic signin, and `/calendar` redirect component tests.
- Signin page rendering, session redirect, Auth.js submit, pending, invalid credential, and generic error component tests.
- Protected calendar component tests for auth guard, default and selected months, day diary links, previous/next month navigation including year rollover, and logout.
- Auth validation tests.
- Argon2 hash and verify helper tests.
- User creation and credential verification helper tests.
- Auth.js session helper tests for `requireUser()`.
- Signup route tests.
- Auth.js provider and JWT/session callback tests.
- Date parsing and route validation tests.
- Diary validation tests.
- Diary database helper tests.
- Diary save route tests.
- Diary editor render and save-state tests.
- Debounced auto-save tests.
- Signup page rendering E2E test.

Pending or needs update:

- Calendar diary-date marker tests.
- Full E2E flow: sign up, land on calendar, select a date, write diary content, auto-save, sign out, sign back in, and confirm saved content.

## Implementation Order

1. Fetch calendar diary-entry dates in the protected server calendar flow and render entry markers.
2. Add `listEntryDatesForMonth(userId, year, month)` with tests.
3. Add full E2E coverage for signup, signin, protected calendar access, diary editing, persistence, logout, and signin recovery.
4. Re-run `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run format:check`, `npm.cmd run test`, and `npm.cmd run test:e2e`.
