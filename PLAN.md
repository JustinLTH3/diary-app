# Full Stack Diary App Plan

## Current Status

- `PLAN.md` has been moved into the Git-tracked project root.
- Created the nested `diary-app` project folder.
- Initialized the project root with Next.js App Router, TypeScript, ESLint, Tailwind CSS, npm, and the `@/*` import alias.
- Added Prettier, Vitest, React Testing Library, jsdom, and Playwright tooling.
- Added smoke tests for the generated starter page.
- Verified the generated project with `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run format:check`, `npm.cmd run test`, and `npm.cmd run test:e2e`.
- Added Prisma CLI and Prisma Client, aligned at version `7.8.0`.
- Added `prisma/schema.prisma` with the `User` and `DiaryEntry` models.
- Added `prisma.config.ts` for Prisma 7 datasource and migration configuration.
- Added the initial PostgreSQL migration for the Prisma schema.
- Added `.env.example` with a placeholder PostgreSQL `DATABASE_URL` and updated `.gitignore` so the example file can be committed.
- Verified the schema milestone with `npx.cmd prisma validate`, `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run test`, and `npm.cmd run format:check`.
- Added the frontend-only signup page at `app/(auth)/signup/page.tsx` with shared theme tokens in `app/globals.css` and tests for the page.
- Prisma client singleton, diary database functions, Auth.js, Argon2, Zod, route handlers, and the signin/calendar/diary app feature UI have not been added yet.

## Stack

- Frontend: Next.js with App Router and TypeScript.
- Backend: Next.js Route Handlers or Server Actions.
- Database: PostgreSQL.
- ORM: Prisma.
- Password hashing: Argon2.
- Authentication: Auth.js with the Credentials provider and JWT session strategy.
- Validation: Zod.
- Testing: Vitest, React Testing Library, and Playwright.
- Styling: Tailwind CSS or the project's existing styling approach.

## Core App Structure

```txt
app/
  (auth)/
    signin/
      page.tsx
    signup/
      page.tsx
  (app)/
    calendar/
      page.tsx
    diary/
      [date]/
        page.tsx
  api/
    auth/
      signup/
        route.ts
      signin/
        route.ts
      signout/
        route.ts
    diary/
      route.ts
      dates/
        route.ts
components/
  auth/
  calendar/
  diary/
lib/
  auth/
  db/
  diary/
  validation/
  dates/
prisma/
tests/
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
- Store dates consistently as PostgreSQL `DATE` values mapped from `YYYY-MM-DD` routes.
- Only `content` is editable by the user.

## Authentication

Authentication uses Auth.js with email/password credentials.

Signup:

- Normalize email.
- Validate email and password.
- Hash password with Argon2.
- Create user.
- Sign the user in through Auth.js.

Signin:

- Normalize email.
- Use the Auth.js Credentials provider.
- Fetch user by email inside the provider.
- Verify password with Argon2 inside the provider.
- Use the Auth.js JWT session strategy.

Route protection:

- Protected pages require a valid Auth.js session.
- Missing sessions redirect to signin.
- The server extracts `userId` from the session and scopes every diary query with it.

## Pages

### Signup Page

- Frontend-only page implemented.
- Email input.
- Password input.
- Submit button.
- Inline status text.
- Validation errors.
- Successful signup redirects to the calendar page once backend signup exists.

### Signin Page

- Email input.
- Password input.
- Submit button.
- Validation errors.
- Successful signin redirects to the calendar page.

### Calendar Page

- Shows a month calendar.
- Lets the user select a date.
- Clicking a day routes to `/diary/YYYY-MM-DD`.
- Marks days that already have diary content.

### Diary Page

Route: `/diary/[date]`

- Loads the authenticated user's diary content for the selected date.
- Shows only an editable content field.
- Auto-saves content after edits.
- Shows save state: saving, saved, or error.
- Creates the entry on first auto-save if none exists.

#### Auto-Save Behavior

- The editor keeps local content state.
- Changes trigger a debounced save after 1 second of no editing.
- Auto-save only runs if the content has changed since the last successful save.
- Save requests are idempotent using `upsert` by `userId + date`.
- If a save fails, show a non-blocking error state and retry on the next edit.
- Avoid saving unchanged content.
- Closing or leaving the page triggers a final save attempt when there are unsaved changes.
- If the final save fails, show a confirmation prompt before quitting with unsaved content.

## Server Logic

Keep business logic outside page components so features can be added later without rewriting routes or UI.

```txt
lib/auth/
  hashPassword.ts
  verifyPassword.ts
  requireUser.ts
  createUser.ts
  verifyCredentials.ts

lib/diary/
  getEntryForDate.ts
  saveEntryContent.ts
  listEntryDatesForMonth.ts

lib/dates/
  parseDiaryDate.ts
  formatDiaryDate.ts
```

Core operations:

- `createUser(email, password)`
- `verifyCredentials(email, password)`
- `requireUser()`: Verifies the Auth.js session and returns the authenticated user.
- `getEntryForDate(userId, date)`
- `saveEntryContent(userId, date, content)`
- `listEntryDatesForMonth(userId, year, month)`

## Validation

Use Zod schemas shared by route handlers and client forms where practical.

```txt
lib/validation/
  auth.ts
  diary.ts
  date.ts
```

Validate:

- Email format.
- Password minimum length.
- Date route format: `YYYY-MM-DD`.
- Content maximum length.

## Testing Plan

Unit tests:

- Date parsing and formatting.
- Validation schemas.
- Argon2 hash and verify helpers.
- Auth.js session helper.
- Diary save logic.

Integration tests:

- Signup creates a user with an Argon2 password hash.
- Signin verifies credentials through Auth.js.
- Protected routes reject missing sessions.
- Diary access is scoped to the authenticated user.

Component tests:

- Calendar renders the correct month.
- Calendar date links point to the correct diary route.
- Diary editor renders existing content.
- Diary editor shows saving, saved, and error states.

End-to-end tests:

- User signs up.
- User selects a date from the calendar.
- User writes diary content.
- Content auto-saves.
- User signs out and signs back in.
- Saved content is still available on the same date.

## Implementation Order

1. Set up Next.js, TypeScript, ESLint, Tailwind CSS, npm, and the base App Router project. Done.
2. Add formatting and test tooling. Done.
3. Add Prisma and the database schema. Partially done: Prisma packages, schema, and initial migration are added; Prisma client wiring, database functions, and database-related tests are not added yet.
4. Implement Argon2 password hashing helpers with unit tests.
5. Implement Auth.js session handling and route protection with integration tests.
6. Build signin flow and finish signup/signin integration tests. Partially done: the frontend-only signup page and tests are added; backend signup/auth integration remains.
7. Add protected app layout with route protection tests.
8. Build the calendar page with component tests.
9. Build the diary page with content-only editing and component tests.
10. Implement debounced auto-save with unit and component tests.
11. Add validation and error handling alongside each related feature.
12. Add E2E tests for the complete signup signin calendar diary and auto-save flow.
