# Smart Event Management and Ticket Booking System

Phase 2 adds the complete authentication module on top of the project setup baseline. The app now includes user registration, user login, admin login, JWT session handling, protected routes, role-based authorization, and logout support.

## Project Structure

- `src/` contains the React frontend built with Vite.
- `backend/` contains the Express backend, MongoDB configuration, and authentication APIs.

## Frontend Setup

1. Copy `.env.example` to `.env` if you want to override the default API URL.
2. Install dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm run dev
```

## Backend Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Replace `MONGODB_URI` with your MongoDB Atlas connection string.
3. Set the admin credentials in `backend/.env` to enable admin login.
4. Install dependencies:

```bash
cd backend
npm install
```

5. Start the backend:

```bash
npm run dev
```

## Authentication Endpoints

- `POST /api/auth/register` creates a user account.
- `POST /api/auth/login` logs in a normal user.
- `POST /api/auth/admin/login` logs in an admin account.
- `GET /api/auth/me` returns the currently authenticated user.
- `GET /api/health` returns API and database health information.
