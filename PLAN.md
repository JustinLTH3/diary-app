# Full Stack Diary App Plan

## Current Status

- `PLAN.md` has been moved into the Git-tracked project root.
- Created the nested `diary-app` project folder.
- Initialized the project root with Next.js App Router, TypeScript, ESLint, Tailwind CSS, npm, and the `@/*` import alias.
- Added Prettier, Vitest, React Testing Library, jsdom, and Playwright tooling.
- Added smoke tests for the generated starter page.
- Verified the generated project with `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run format:check`, `npm.cmd run test`, and `npm.cmd run test:e2e`.
- Added Prisma CLI and Prisma Client, aligned at version `7.8.0`.
- Added the Prisma Postgres driver adapter for Prisma 7 runtime database connections.
- Added `prisma/schema.prisma` with the `User` and `DiaryEntry` models.
- Added `prisma.config.ts` for Prisma 7 datasource and migration configuration.
- Added the initial PostgreSQL migration for the Prisma schema.
- Added `.env.example` with placeholder `DATABASE_URL` and `AUTH_SECRET` values, and updated `.gitignore` so the example file can be committed.
- Verified the schema milestone with `npx.cmd prisma validate`, `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run test`, and `npm.cmd run format:check`.
- Added the frontend-only signup page at `app/(auth)/signup/page.tsx` with shared theme tokens in `app/globals.css` and tests for the page.
- Added the Prisma client singleton, Zod auth validation, Argon2 password helpers, Auth.js Credentials configuration with JWT sessions, and backend signup/Auth.js route handlers.
- Added unit and route tests for auth validation, password hashing, credential verification, and the signup API route.
- Wired the signup form to `POST /api/auth/signup`, including pending, success, duplicate-email, and generic error states.
- Added component tests for the signup form's frontend API integration states.
- Verified signup against a local Docker PostgreSQL database after applying the initial Prisma migration.
- Added a visual-only signin page at `app/(auth)/signin/page.tsx` that matches the signup theme.
- Extracted the visual-only signin form into `components/auth/signin-form.tsx`.
- Added component coverage for the visual-only signin page.
- Hardened the Auth.js Credentials provider so malformed signin credentials return `null` before credential verification.
- Added Auth.js configuration tests for signin authorization plus JWT/session user id propagation.
- Route protection, diary database functions, functional signin frontend wiring, and the calendar/diary feature UI have not been added yet.

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
- Backend signup route implemented at `app/api/auth/signup/route.ts`.
- Signup frontend integration is implemented and stays on `/signup` after successful account creation.
- Automatic signin through Auth.js is not wired yet.

Signin:

- Normalize email.
- Use the Auth.js Credentials provider.
- Fetch user by email inside the provider.
- Verify password with Argon2 inside the provider.
- Use the Auth.js JWT session strategy.
- Auth.js configuration and provider wiring are implemented.
- Malformed provider credentials return `null` before calling the credential verifier.
- JWT sessions expose the authenticated user's id on `session.user.id`.
- The signin page is visual-only and is not connected to Auth.js yet.
- Functional signin frontend submission and redirect behavior remain pending.

Route protection:

- Protected pages require a valid Auth.js session.
- Missing sessions redirect to signin.
- The server extracts `userId` from the session and scopes every diary query with it.

## Pages

### Signup Page

- Page implemented and connected to the backend signup route.
- Email input.
- Password input.
- Submit button.
- Inline status text.
- Validation errors.
- Submit posts credentials to `POST /api/auth/signup`.
- Shows pending, success, duplicate-email, invalid-credentials, and generic error states.
- Successful signup currently stays on `/signup`; redirect or automatic signin remains pending.

### Signin Page

- Visual-only page implemented at `/signin`.
- Email input.
- Password input.
- Non-functional `type="button"` submit-style button.
- Link to the signup page.
- No client component, submit handler, validation state, Auth.js call, or redirect is wired yet.
- Future functional signin should validate credentials through Auth.js and redirect successful signins to the calendar page.

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
  createUser.ts
  verifyCredentials.ts
  requireUser.ts

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
- Validation schemas. Implemented for auth credentials.
- Argon2 hash and verify helpers. Implemented.
- Signup form API integration states. Implemented with mocked `fetch`.
- Auth.js Credentials provider and JWT/session callbacks. Implemented.
- Auth.js session helper.
- Diary save logic.

Integration tests:

- Signup creates a user with an Argon2 password hash. Implemented via route/helper tests.
- Signin verifies credentials through Auth.js. Helper and Auth.js configuration coverage are implemented; frontend flow remains.
- Protected routes reject missing sessions.
- Diary access is scoped to the authenticated user.

Component tests:

- Visual-only signin page renders expected fields and links. Implemented.
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
3. Add Prisma and the database schema. Partially done: Prisma packages, schema, Prisma 7 Postgres adapter wiring, and initial migration are added; diary database functions and database-related tests are not added yet.
4. Implement Argon2 password hashing helpers with unit tests. Done.
5. Implement Auth.js session handling and route protection with integration tests. Partially done: Auth.js Credentials, JWT session configuration, credential hardening, and callback tests are added; route protection and session helper coverage remain.
6. Build signin flow and finish signup/signin integration tests. Partially done: the signup page is wired to the backend route, auth helper/route tests are added, signup frontend integration tests are added, and a visual-only signin page exists; functional signin frontend wiring remains.
7. Add protected app layout with route protection tests.
8. Build the calendar page with component tests.
9. Build the diary page with content-only editing and component tests.
10. Implement debounced auto-save with unit and component tests.
11. Add validation and error handling alongside each related feature.
12. Add E2E tests for the complete signup signin calendar diary and auto-save flow.
