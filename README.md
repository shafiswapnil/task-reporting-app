# Task Reporting Web App

A full-stack web application for daily/weekly/monthly task reporting, management, and analytics for developers and admins. Built with **Next.js** (frontend) and **Node.js/Express** (backend), using **Prisma** ORM and a relational database.

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone the Repository](#2-clone-the-repository)
  - [3. Environment Variables](#3-environment-variables)
  - [4. Database Setup & Migration](#4-database-setup--migration)
  - [5. Seeding the Database](#5-seeding-the-database)
  - [6. Running the Backend](#6-running-the-backend)
  - [7. Running the Frontend](#7-running-the-frontend)
- [Backend API Overview](#backend-api-overview)
- [Frontend Overview](#frontend-overview)
- [Authentication & Authorization](#authentication--authorization)
- [Admin & Developer Roles](#admin--developer-roles)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **User Authentication**: JWT-based login for both Admins and Developers.
- **Role-based Access**: Admins can manage all tasks; Developers can manage their own.
- **Task Management**: Create, update, delete, and view tasks.
- **Reporting**: Generate daily, weekly, and monthly reports.
- **Missing Reports**: Calendar view for missing task submissions.
- **Rate Limiting & Security**: API rate limiting, error handling, and secure password storage.
- **Modern UI**: Responsive, themeable frontend with Next.js and Tailwind CSS.

---

## Architecture Overview

- **Backend**: Node.js/Express REST API, Prisma ORM, JWT authentication, role-based middleware.
- **Frontend**: Next.js (React), API routes for server-side logic, NextAuth for session management.
- **Database**: Relational (PostgreSQL recommended), managed via Prisma schema and migrations.

---

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, NextAuth, Axios
- **Backend**: Node.js, Express, Prisma, JWT, bcrypt, Joi, dotenv
- **Database**: PostgreSQL (or compatible)
- **Other**: Vercel (optional deployment), Docker (optional)

---

## Project Structure

\`\`\`
task-reporting-webapp/
│
├── backend/
│ ├── app.js, server.js
│ ├── routes/ # Express route handlers (auth, tasks, reports, developers, admin)
│ ├── models/ # Prisma-based models (Admin, Developer)
│ ├── middleware/ # Auth, admin, error, rate limiter
│ ├── prisma/ # schema.prisma, migrations, seed.js
│ └── scripts/ # Utility scripts (reset password, create test user)
│
├── frontend/
│ ├── src/
│ │ ├── app/ # Next.js app directory (pages, layouts, API routes)
│ │ ├── components/ # React components (forms, lists, UI)
│ │ ├── contexts/ # React context providers
│ │ ├── hooks/ # Custom React hooks
│ │ ├── lib/ # Utility libraries (axios, helpers)
│ │ ├── services/ # API service functions
│ │ └── types/ # TypeScript types
│ ├── public/ # Static assets
│ ├── tailwind.config.ts, postcss.config.js
│ └── README.md
│
└── LICENSE
\`\`\`

---

## Setup Instructions

### 1. Prerequisites

- Node.js (v18+ recommended)
- npm, yarn, or pnpm
- PostgreSQL (or compatible database)
- [Optional] Docker

### 2. Clone the Repository

\`\`\`bash
git clone <repo-url>
cd task-reporting-webapp
\`\`\`

### 3. Environment Variables

Create \`.env\` files in both \`backend/\` and \`frontend/\` directories.

#### Backend \`.env\` example:

\`\`\`
DATABASE_URL=postgresql://user:password@localhost:5432/task_reporting
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
\`\`\`

#### Frontend \`.env\` example:

\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXTAUTH_SECRET=your_nextauth_secret
BACKEND_URL=http://localhost:5001
\`\`\`

### 4. Database Setup & Migration

Navigate to the backend directory:

\`\`\`bash
cd backend
npm install
npx prisma migrate deploy
\`\`\`

Or, for development:

\`\`\`bash
npx prisma migrate dev
\`\`\`

### 5. Seeding the Database

Seed initial admin and developer users:

\`\`\`bash
node prisma/seed.js
\`\`\`

You can also use utility scripts:

\`\`\`bash
node scripts/createTestDeveloper.js
node scripts/resetAdminPassword.js
\`\`\`

### 6. Running the Backend

\`\`\`bash
npm install
npm run dev # or: node server.js
\`\`\`

The backend will run on \`http://localhost:5001\`.

### 7. Running the Frontend

Open a new terminal:

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

The frontend will run on \`http://localhost:3000\`.

---

## Backend API Overview

- **Auth**: \`/api/auth/\`
  - \`POST /login\` — Login as admin or developer
  - \`POST /register-admin\` — Register admin
  - \`POST /register-developer\` — Register developer
- **Developers**: \`/api/developers/\`
  - CRUD operations for developer profiles (admin only for some)
- **Tasks**: \`/api/tasks/\`
  - \`POST /\` — Submit task (developer)
  - \`GET /submitted\` — Get developer's submitted tasks
  - \`GET /admin\` — Get all tasks (admin)
  - \`POST /admin\` — Create task (admin)
  - \`PUT /admin/:id\` — Update task (admin)
  - \`DELETE /admin/:id\` — Delete task (admin)
- **Reports**: \`/api/reports/\`
  - \`GET /\` — Generate reports (admin)
  - \`GET /missing\` — Get missing reports for a developer

All routes are protected by JWT authentication and role-based middleware.

---

## Frontend Overview

- **Login Page**: \`/login\` — Authenticates user and sets session.
- **Dashboard**: \`/dashboard\` — Developer's task submission and history.
- **Admin Panel**: \`/admin\` — Admin can view, create, edit, and delete any task, generate reports, and export data.
- **Task Submission**: \`/task\` — Submit daily/weekly tasks.
- **Missing Reports Calendar**: Visualizes days with missing submissions.
- **API Integration**: Uses Axios and Next.js API routes to communicate with backend.

---

## Authentication & Authorization

- **JWT** is used for backend API authentication.
- **NextAuth** is used on the frontend for session management.
- **Role-based Middleware**:
  - \`authMiddleware\` — Validates JWT and attaches user to request.
  - \`adminMiddleware\` — Restricts certain routes to admins only.

---

## Admin & Developer Roles

- **Admin**:
  - Can manage all tasks, developers, and generate reports.
  - Can reset passwords and manage other admins.
- **Developer**:
  - Can submit, update, and delete their own tasks.
  - Can view their own reports and missing days.

---

## Scripts

- \`backend/scripts/createTestDeveloper.js\`: Creates a test developer.
- \`backend/scripts/resetAdminPassword.js\`: Resets or creates an admin user.
- \`backend/prisma/seed.js\`: Seeds the database with initial data.

Run with:

\`\`\`bash
node scripts/createTestDeveloper.js
node scripts/resetAdminPassword.js
node prisma/seed.js
\`\`\`

---

## Deployment

### Deploying Frontend

- The frontend is ready for deployment on [Vercel](https://vercel.com/) or any platform supporting Next.js.
- See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying).

### Deploying Backend

- Deploy the backend to any Node.js-compatible server (Heroku, Render, DigitalOcean, etc.).
- Ensure environment variables are set and the database is accessible.

---

## Contributing

1. Fork the repository.
2. Create a new branch: \`git checkout -b feature/your-feature\`
3. Make your changes and commit: \`git commit -m 'Add feature'\`
4. Push to your fork: \`git push origin feature/your-feature\`
5. Open a Pull Request.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

**For more details, review the codebase and comments in each directory.** If you have questions or need help, please open an issue or contact the maintainer.
