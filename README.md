# Eventify

Eventify is a full-stack event publishing and ticket booking platform. The app includes user and admin authentication, a public homepage, a user dashboard, live events APIs, event detail pages, ticket booking APIs, user booking history, an events discovery page, and admin-protected event plus booking oversight.

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
4. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from your Razorpay test account to ackend/.env for paid-ticket checkout.
5. Install dependencies:

```bash
cd backend
npm install
```

6. Start the backend:

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
- `POST /api/events` creates a new event for an authenticated user.
- `PUT /api/events/:id` updates an existing event for an authorized user.
- `GET /api/bookings` returns bookings for the logged-in user.
- `POST /api/bookings` creates a free-event booking for the logged-in user.`r`n- `POST /api/payments/orders` creates a Razorpay order for a paid booking.`r`n- `POST /api/payments/verify` verifies the Razorpay signature and confirms the paid booking.
- `POST /api/bookings/:id/cancel` cancels a user booking and restores inventory.
- `GET /api/bookings/admin/list` returns all bookings for admins.
- `GET /api/health` returns API and database health information.
