# Mohammad Eltegani | Photography Portfolio

A full-stack photography portfolio. The gallery is loaded from a Postgres database through a custom API, and visitors can create an account, sign in and stay signed in across page refreshes.

- **Live site:** https://photography-app-a1.vercel.app/
- **API:** https://photography-app-a1.onrender.com (try `/api/health` and `/api/photos`)

> The API runs on a free Render instance that sleeps after 15 minutes without traffic. The first request after a long idle can take about a minute; refresh and it will load.

## Features

- Responsive photo gallery grid (`object-fit: cover`) loaded from the database
- Category filter built with `useState`
- Favorite button on each photo (a controlled, reusable component)
- Real signup, login and logout with sessions that survive a refresh
- Header shows "Sign in" or "Hi, name / Sign out" depending on state
- "Book a shoot" contact form
- Mobile-first layout with no horizontal scroll

## Tech stack

| Part | Tools |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express |
| Database | PostgreSQL (Neon) via the `pg` library |
| Auth | `bcryptjs` for password hashing, `express-session` with `connect-pg-simple` for sessions |
| Hosting | Vercel (frontend), Render (API), Neon (database) |

## Project structure

```
.
├── client/                    React app
│   ├── index.html
│   ├── vite.config.js         dev proxy: /api -> http://localhost:3001
│   ├── vercel.json            production rewrite: /api -> the live API
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js             fetch helper used by every request
│       ├── index.css          Tailwind import + theme colors
│       ├── context/AuthContext.jsx    who is signed in, shared app-wide
│       └── components/        Header, Hero, Gallery, FavoriteButton,
│                              AuthModal, About, Contact, Footer
└── server/                    Express API
    └── src/
        ├── index.js           app setup, sessions, route mounting
        ├── db.js              Postgres connection pool
        ├── schema.sql         table definitions
        ├── seed.js            creates tables and loads the photos
        ├── seedData.js        the gallery data
        └── routes/
            ├── photos.js      GET /api/photos
            └── auth.js        signup, login, me, logout
```

## API

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/photos` | All gallery photos as JSON |
| POST | `/api/auth/signup` | Create an account and sign in |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | The signed-in user, or `null` |
| POST | `/api/auth/logout` | Sign out |

## Database

- **users**: one row per person, with `name`, a unique `email`, and a hashed password. The real password is never stored.
- **photos**: one row per gallery picture, with `title`, `category`, `layout` (normal, tall or wide), `src` (image link) and `alt` text.
- **session**: created automatically by `connect-pg-simple`. It remembers who is signed in, which is why a refresh doesn't log you out.

## How authentication works

1. The browser sends the email and password to `/api/auth/login`.
2. The server compares the password with the stored bcrypt hash.
3. If it matches, the server creates a session in Postgres and sends back an HTTP-only cookie.
4. On every page load, the client calls `/api/auth/me`, and the cookie tells the server who the user is.
5. Logging out destroys the session and clears the cookie.

In production, the browser only calls `/api/...` on the Vercel domain, and Vercel forwards those requests to the API (`client/vercel.json`). That keeps the cookie first-party, so browsers don't block it.

## Environment variables

Secrets live in `server/.env`, which is git-ignored. Copy `server/.env.example` and fill it in:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string |
| `SESSION_SECRET` | Long random string used to sign session cookies |
| `PORT` | API port (defaults to 3001) |
| `NODE_ENV` | Set to `production` on the host so cookies are marked secure |

## Run locally

You need Node 20.6 or newer and a free Neon database.

```
# 1. API
cd server
cp .env.example .env        # then fill in DATABASE_URL and SESSION_SECRET
npm install
npm run seed                # creates tables and loads the photos
npm run dev                 # http://localhost:3001

# 2. Frontend (in a second terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

## Deployment

- **Database:** Neon free Postgres project.
- **API (Render):** Web Service with Root Directory `server`, Build Command `npm install`, Start Command `npm start`, and the environment variables above.
- **Frontend (Vercel):** Root Directory `client`, Vite preset. `client/vercel.json` rewrites `/api/*` to the API URL.

## Notes

- Gallery images are placeholders from picsum.photos and can be swapped in `server/src/seedData.js` (then run `npm run seed` again).
- The contact form does not send anything yet; submitting it shows a thank-you message.
- I moved the API from Railway to Render during a Railway outage; the code did not need to change.