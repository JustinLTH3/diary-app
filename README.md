# Diary App

A full-stack diary application with user authentication, a monthly calendar view with entry markers, and a diary editor with auto-save.

## Tech Stack

| Layer      | Technology                                                    |
| ---------- | ------------------------------------------------------------- |
| Frontend   | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Backend    | Next.js Route Handlers, server components                     |
| Database   | PostgreSQL                                                    |
| ORM        | Prisma 7                                                      |
| Auth       | Auth.js with Credentials provider & JWT                       |
| Validation | Zod                                                           |
| Testing    | Vitest, React Testing Library, Playwright                     |

## Prerequisites

- **Node.js** >= 22
- **PostgreSQL** running locally or remotely
- **npm** (or yarn / pnpm / bun)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/JustinLTH3/diary-app.git
   cd diary-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in your values:

   ```bash
   cp .env.example .env
   ```

   Required variables:

   | Variable       | Description                              |
   | -------------- | ---------------------------------------- |
   | `DATABASE_URL` | PostgreSQL connection string             |
   | `AUTH_SECRET`  | Random secret for Auth.js JWT encryption |

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

## Features

- User authentication (signup / signin with email and password)
- Protected routes
- Monthly calendar view with previous/today/next navigation and diary-entry markers
- Diary editor with debounced auto-save and save-state indicator (saving / saved / error)
- Unsaved-changes confirmation on in-app navigation and browser unload
- Writing count display

## Project Structure

```
app/              # Next.js App Router pages and API routes
components/       # React components (auth, calendar, diary)
lib/              # Server helpers (auth, db, diary, dates, validation)
prisma/           # Prisma schema and migrations
tests/            # Vitest and Playwright test suites
types/            # TypeScript declarations
```

## See Also

[`PLAN.md`](./PLAN.md) — full data model, implementation details, and testing plan.
