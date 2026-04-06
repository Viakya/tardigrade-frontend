# Tardigrade Frontend# Tardigrade Frontend - Vue.js



## Prerequisites## Overview

- Node.js (per `frontend/package.json` engines)This is the Vue.js frontend for the Tardigrade Coaching Management System. It provides role-based dashboards and login functionality for different user types.

- npm

## Tech Stack

## Setup- **Vue 3** - Progressive JavaScript Framework

1. Install dependencies:- **TypeScript** - Type-safe development

   - `npm install`- **Vite** - Fast build tool and dev server

2. Create `frontend/.env` with:- **Vue Router** - Client-side routing

   - `VITE_API_BASE_URL=http://localhost:5000`- **Pinia** - State management
   - `VITE_RAZORPAY_KEY_ID=rzp_test_...` (optional, for online fee payments)

- **Axios** - HTTP client for API calls

## Run

- Start the dev server:## User Roles

  - `npm run dev`The application supports 6 different user roles, each with their own dedicated dashboard:



The app is available at `http://localhost:5173` by default.1. **Admin** - Full system access, database CRUD dashboard, and insights

2. **Director** - Operations management (students, batches, fees, salary)

## Build3. **Manager** - Operations management (students, batches, fees, salary)

- `npm run build`4. **Coach** - Attendance and test management

- `npm run preview` (optional)5. **Student** - View own data (attendance, tests, fees)

6. **Parent** - View children's data (attendance, tests, fees)

## Demo Credentials

| Role      | Email                    | Password     |
|-----------|--------------------------|--------------|
| Admin     | admin@test.com           | Admin@123    |
| Director  | director@test.com        | Director@123 |
| Coach     | coach@test.com           | Coach@123    |
| Student   | student@test.com         | Student@123  |

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://127.0.0.1:5000`

### Installation

1. Install dependencies:
```sh
npm install
```

2. Environment variables are already configured in `.env`:
```
VITE_API_BASE_URL=http://127.0.0.1:5000
```

3. Start the development server:
```sh
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production
```sh
npm run build
```

## Deploy to Vercel

1. Push the frontend repo to GitHub.
2. In Vercel, **New Project** → import the repo.
3. Framework preset: **Vite** (auto-detected).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variables in Vercel:
   - `VITE_API_BASE_URL=https://tardigarde-backend.onrender.com/api/v1`
   - `VITE_GOOGLE_CLIENT_ID=<your-client-id>`
   - `VITE_RAZORPAY_KEY_ID=<your-razorpay-key>`

> Note: `vercel.json` includes a SPA rewrite so all routes load `index.html`.

## Features

### Authentication
- JWT-based authentication
- Token stored in localStorage
- Automatic token refresh on page reload
- Redirect to login on 401 (Unauthorized)
- Permission error handling on 403 (Forbidden)

### Route Guards
- Protected routes require authentication
- Role-based access control
- Automatic redirection based on user role

### Available Routes
- `/` - Redirects to login
- `/login` or `/login/:role` - Login page with role switcher
- `/admin/dashboard` - Admin database console with full CRUD
- `/operations/dashboard` - Operations dashboard (director, manager)
- `/coach/dashboard` - Coach dashboard (coach only)
- `/student/dashboard` - Student dashboard (student only)
- `/parent/dashboard` - Parent dashboard (parent only)

### Batch Portal Resources
- Coaches can add YouTube/video/article links for each batch.
- Students can view embedded videos and click external links on their batch portal.

### AI Quizzes
- Coaches can generate quizzes via AI and publish to students.
- Students can attempt published quizzes from their dashboard.

## Backend API
Base URL: `http://127.0.0.1:5000`
API Prefix: `/api/v1`

See backend documentation for complete API reference.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking.
