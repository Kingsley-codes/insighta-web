# Insighta Web

Insighta Web is the frontend for the Insighta Labs+ profile intelligence platform. It provides a polished web interface for authentication, profile browsing, natural-language search, CSV export, and role-based access to admin actions.

Built with Next.js App Router, React 19, TypeScript, Tailwind CSS v4, React Query, Axios, and Framer Motion.

## Features

- Landing page with product overview and onboarding entry points
- Email/password sign up and sign in
- GitHub OAuth sign in
- Cookie-based session handling with automatic token refresh
- Protected dashboard route
- Structured profile browsing with filters, sorting, and pagination
- Natural-language profile search
- Profile detail view
- CSV export
- Role-based access:
  - `analyst`: read-only dashboard access
  - `admin`: can create and delete profiles

## Routes

- `/` - marketing landing page
- `/login` - sign in
- `/signup` - create account
- `/dashboard` - authenticated profile workspace

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack React Query
- Axios
- Framer Motion
- Sonner
- Lucide React

## Getting Started

### Prerequisites

- Node.js 20+ recommended
- npm
- A running Insighta backend API

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the project root with:

```env
NEXT_PUBLIC_API_URL=https://hng-stage-1-production-7d03.up.railway.app
```

Point `NEXT_PUBLIC_API_URL` to the Insighta backend you want this frontend to use.

### Run the development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Backend Integration

This frontend expects the backend to expose authentication and profile endpoints under the base URL defined in `NEXT_PUBLIC_API_URL`.

### Auth endpoints used

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /auth/me`
- `GET /auth/github`

### Profile endpoints used

- `GET /api/profiles`
- `GET /api/profiles/:id`
- `POST /api/profiles`
- `DELETE /api/profiles/:id`
- `GET /api/profiles/search`
- `GET /api/profiles/export`

### Important integration details

- Requests are sent with `withCredentials: true`, so the backend must support cookie-based auth and CORS credentials.
- The app sends `X-API-Version: 1.0` on requests.
- When a protected request returns `401`, the client attempts a refresh via `/auth/refresh` and retries the original request automatically.

## Dashboard Capabilities

### Browse mode

- Filter by gender, age group, country code, min age, and max age
- Sort by `created_at`, `age`, or `gender_probability`
- Paginate result sets
- Export filtered results as CSV

### Search mode

- Submit natural-language queries such as `young males from nigeria`
- Review paginated search results
- Inspect full profile details beside the result list

## Project Structure

```text
src/
  app/
    dashboard/
    login/
    signup/
  components/
    authentication/
  hooks/
  lib/
  types/
```

## Notes

- Dashboard access is protected on the client and redirects unauthenticated users to `/login`.
- React Query Devtools are enabled in development only.
- This project currently relies on a single public environment variable: `NEXT_PUBLIC_API_URL`.
