# Smart Event Management and Ticket Booking System

Phase 5 adds the events module on top of the existing project foundation. The app now includes user and admin authentication, a public landing page, a user dashboard, a live events API, sample event bootstrapping, an events discovery page, and admin-protected event publishing.

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

## API Endpoints

- `POST /api/auth/register` creates a user account.
- `POST /api/auth/login` logs in a normal user.
- `POST /api/auth/admin/login` logs in an admin account.
- `GET /api/auth/me` returns the currently authenticated user.
- `GET /api/events` returns published events for the public app.
- `GET /api/events?featured=true&limit=3` returns featured events for the landing page.
- `GET /api/events/:slug` returns one published event by slug.
- `GET /api/events/admin/list` returns all events for admins.
- `POST /api/events` creates a new event for admins.
- `PUT /api/events/:id` updates an existing event for admins.
- `GET /api/health` returns API and database health information.

## Current Phases

- `Phase 3` delivers the landing page.
- `Phase 4` delivers the user dashboard.
- `Phase 5` delivers the events module.
- `Phase 6` is planned for the booking module.
