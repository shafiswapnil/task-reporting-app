# Task Reporting Web App

A comprehensive task management and reporting system for development teams.

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

## Key Directories

### Backend

- `config/`: Configuration files for various services
- `middleware/`: Express middleware for auth, admin, errors
- `models/`: Prisma models and business logic
- `routes/`: Express route handlers
- `scripts/`: Utility scripts for development
- `prisma/`: Database schema and migrations

### Frontend

- `app/`: Next.js pages and API routes
- `components/`: Reusable React components
- `contexts/`: React context providers
- `hooks/`: Custom React hooks
- `services/`: API integration services
- `types/`: TypeScript type definitions


## 🌟 Features

- **Task Management**: Submit, track, and manage daily development tasks
- **Role-based Access**: Separate interfaces for developers and admins
- **Real-time Reporting**: Generate daily, weekly, and monthly reports
- **Missing Reports Tracking**: Visual calendar to track missing submissions
- **API Documentation**: Interactive Swagger UI for API testing and documentation

## 🏗 Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI

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

3. **Install Dependencies**

   ```bash
   # Backend setup
   cd backend
   npm install
   npx prisma migrate dev
   npm run dev

   # Frontend setup
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Initialize Database**
   ```bash
   cd backend
   npm run prisma:seed
   ```

## 🛠 Development

### Backend API (localhost:5001)

- **Auth**: Authentication and user management
- **Tasks**: Task CRUD operations
- **Reports**: Report generation and analytics
- **Developers**: Developer profile management
- **Admins**: Administrative functions

### Frontend Pages (localhost:3000)

- **/login**: Authentication page
- **/dashboard**: Developer's task dashboard
- **/admin**: Admin control panel
- **/task**: Task submission form
- **/unauthorized**: Access denied page

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

## 📚 API Documentation

Access the interactive API documentation at:

```
http://localhost:5001/api-docs
```

## 🛡️ Security

- JWT-based authentication
- Role-based access control
- Rate limiting
- Input validation
- Password hashing

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
- Set environment variables

### Frontend

- Deploy to Vercel or any Next.js-compatible platform
- Configure environment variables
- Set up authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

---

📝 **Note**: For any questions or support, please open an issue in the repository.
