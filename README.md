# Task Reporting Web Application

A comprehensive task management and reporting system designed for development teams, featuring role-based access control, real-time reporting, and detailed task tracking capabilities.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/shafiswapnil/task-reporting-app)

## Project Structure

```
task-reporting-webapp/
├── backend/
│   ├── config/
│   │   └── swagger.js         # Swagger API documentation config
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT authentication
│   │   ├── adminMiddleware.js # Admin role verification
│   │   ├── errorHandler.js    # Global error handling
│   │   └── rateLimiter.js    # API rate limiting
│   ├── models/
│   │   ├── Admin.js          # Admin model & methods
│   │   └── Developer.js      # Developer model & methods
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── seed.js          # Database seeding
│   │   └── migrations/      # Database migrations
│   ├── routes/
│   │   ├── admin.js         # Admin routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── developers.js   # Developer management
│   │   ├── reports.js      # Reporting endpoints
│   │   └── tasks.js        # Task management
│   ├── scripts/
│   │   ├── createTestDeveloper.js
│   │   └── resetAdminPassword.js
│   ├── server.js           # Main application entry
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   │   ├── admin/     # Admin dashboard
│   │   │   ├── api/       # API route handlers
│   │   │   ├── dashboard/ # Developer dashboard
│   │   │   ├── login/     # Authentication
│   │   │   └── task/      # Task management
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utility functions
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript types
│   ├── public/           # Static assets
│   └── package.json
│
├── README.md
└── LICENSE
```

## 🌟 Features

- **Task Management**

  - Daily task submission and tracking
  - Project-based organization
  - Status tracking with multiple states
  - Target achievement monitoring

- **Role-based Access Control**

  - Developer dashboard for task submission
  - Admin panel for oversight and management
  - Secure authentication and authorization

- **Advanced Reporting**

  - Daily, weekly, and monthly reports
  - Missing report tracking
  - Project-based filtering
  - Export capabilities

- **Developer Management**
  - Team assignment (Web/App)
  - Working days configuration
  - Project allocation
  - Profile management

## 🏗 Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Security**: Rate limiting, input validation, password hashing

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database
- Git

### Installation

1. **Clone the Repository**

   ```bash
   git clone <repo-url>
   cd task-reporting-webapp
   ```

2. **Set Up Environment Variables**

   Backend (.env):

   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/task_reporting
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:3000
   ```

   Frontend (.env):

   ```
   NEXT_PUBLIC_API_URL=http://localhost:5001
   NEXTAUTH_SECRET=your_nextauth_secret
   BACKEND_URL=http://localhost:5001
   ```

3. **Install Dependencies & Start Services**

   ```bash
   # Backend setup
   cd backend
   npm install
   npx prisma migrate dev
   npm run dev

   # Frontend setup (in new terminal)
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Initialize Database**
   ```bash
   cd backend
   npm run prisma:seed
   ```

## 📚 API Documentation

Access the interactive API documentation at:

```
http://localhost:5001/api-docs
```

### API Endpoints

#### Auth Routes

- POST /api/auth/login - User authentication
- POST /api/auth/register-developer - Developer registration
- POST /api/auth/register-admin - Admin registration

#### Task Routes

- GET /api/tasks - Get user's tasks
- POST /api/tasks - Submit new task
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

#### Report Routes

- GET /api/reports - Generate reports
- GET /api/reports/missing - Track missing reports

#### Admin Routes

- GET /api/developers - List all developers
- POST /api/developers - Add new developer
- PUT /api/developers/:id - Update developer
- DELETE /api/developers/:id - Delete developer

## 👥 User Roles

### Admin

- Manage developers and tasks
- Generate and export reports
- View all submissions
- Reset passwords

### Developer

- Submit daily tasks
- View personal submissions
- Track missing reports
- Update profile

## 🛡️ Security Features

- JWT-based authentication
- Role-based access control
- API rate limiting
- Input validation
- Password hashing
- CORS configuration

## 🧰 Utility Scripts

```bash
# Create test developer
node backend/scripts/createTestDeveloper.js

# Reset admin password
node backend/scripts/resetAdminPassword.js

# Seed database
node backend/prisma/seed.js
```

## 📦 Deployment

### Backend

- Deploy to any Node.js hosting (Heroku, DigitalOcean, etc.)
- Ensure PostgreSQL database is accessible
- Configure environment variables
- Set up CORS for production domain

### Frontend

- Deploy to Vercel or any Next.js-compatible platform
- Configure environment variables
- Set up authentication in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the AGPLv3 License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Important Notes

- Set strong passwords for admin and JWT secrets
- Configure proper CORS settings in production
- Regularly backup the database
- Monitor API rate limits
- Keep dependencies updated

---

📝 For questions or support, please open an issue in the repository.
