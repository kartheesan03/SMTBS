# Smart Material Tracking and Business Management System (SMTBMS)

A full-stack enterprise resource planning and material tracking solution built with React, Node.js, Express, and MongoDB.

## Features
- **Role-Based Authentication**: Admin, HR, Manager, Employee, and Sales roles.
- **Material Tracking**: Inventory management with low-stock alerts.
- **HRMS**: Employee management and basic HR operations.
- **Analytics Dashboard**: Visual charts for sales and usage tracking.
- **Modern UI**: Dark-themed glassmorphism design with responsive sidebar.

## Project Structure
```
root/
├── backend/            # Express.js Server
│   ├── config/         # Database configuration
│   ├── controllers/    # Business logic
│   ├── models/         # MongoDB Schemas
│   ├── middleware/     # Auth & Role protection
│   └── routes/         # API Endpoints
└── frontend/           # React App (Vite)
    ├── src/api/        # Axios configuration
    ├── src/components/ # Reusable UI components
    ├── src/context/    # State management
    └── src/pages/      # Application views
```

## Setup Instructions

### 1. Prerequisite
- Node.js installed
- MongoDB installed and running locally on `localhost:27017`

### 2. Backend Setup
```bash
cd backend
npm install
# Ensure .env values are correct
npm start (or nodemon server.js)
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Demo Login
1. Go to Signup and create an account with **Admin** role.
2. Log in with those credentials.
3. Start adding materials and employees!

## Tech Stack
- **Frontend**: React, React Router, Recharts, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, Mongoose, JWT, Bcrypt.
- **Design**: Vanilla CSS with Modern Glassmorphism.

