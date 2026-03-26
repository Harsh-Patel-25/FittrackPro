# FitTrack Pro – Setup & Run Guide

## Tech Stack
- **Frontend**: AngularJS 1.8.3 (vanilla JS, no build step)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Auth**: JWT (JSON Web Tokens)

---

## Prerequisites
- Node.js v16+ installed
- MongoDB running locally (`mongod`)

---

## 1. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 2. Environment Configuration

The `.env` file is already created at `backend/.env` with defaults:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/fittrack_pro
JWT_SECRET=fittrack_super_secret_jwt_key_change_in_production_2024
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5000
```

Adjust `MONGO_URI` if your MongoDB runs on a different host/port.

---

## 3. Start MongoDB

Make sure MongoDB is running:
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
net start MongoDB
```

---

## 4. Seed Demo Data (Optional)

Populates the database with a demo user and sample workouts/nutrition/goals:

```bash
cd backend
node utils/seed.js
```

Demo credentials after seeding:
- **Email**: `demo@fittrack.com`
- **Password**: `demo123`

---

## 5. Start the Server

```bash
cd backend
npm start          # production
# OR
npm run dev        # development (auto-restarts with nodemon)
```

The server starts on **http://localhost:5000** and serves both:
- **Frontend** → `http://localhost:5000` (AngularJS SPA)
- **API** → `http://localhost:5000/api/*`

---

## 6. Open the App

Open your browser to: **http://localhost:5000**

The Express server serves the `frontend/` folder as static files — **no separate frontend server needed**.

---

## Project Structure

```
fittrack-pro/
├── backend/
│   ├── controllers/         # Route handlers
│   │   ├── auth.controller.js
│   │   ├── workout.controller.js
│   │   ├── nutrition.controller.js
│   │   ├── progress.controller.js
│   │   └── goal.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT protect + generateToken
│   │   └── errorHandler.js
│   ├── models/              # Mongoose schemas
│   │   ├── user.model.js
│   │   ├── workout.model.js
│   │   ├── nutrition.model.js
│   │   └── goal.model.js
│   ├── routes/              # Express routers
│   ├── utils/
│   │   ├── logger.js        # Winston logger
│   │   └── seed.js          # Demo data seeder
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── server.js            # Entry point
│
└── frontend/
    ├── app/
    │   ├── app.module.js     # Angular module declaration
    │   ├── app.config.js     # Routes + HTTP interceptor config
    │   ├── controllers/      # AngularJS controllers
    │   ├── services/         # $http services + AuthInterceptor
    │   ├── filters/          # Custom filters (caloriesFmt, durationFmt, etc.)
    │   └── directives/       # Custom directives (progressRing, statCard, etc.)
    ├── assets/css/           # Stylesheets
    ├── views/                # HTML partials (ng-view templates)
    │   ├── auth/
    │   ├── dashboard/
    │   ├── workouts/
    │   ├── nutrition/
    │   ├── progress/
    │   └── settings/
    └── index.html            # App shell
```

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Workouts
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workouts` | List workouts (paginated) |
| POST | `/api/workouts` | Log new workout |
| PUT | `/api/workouts/:id` | Update workout |
| DELETE | `/api/workouts/:id` | Delete workout |
| GET | `/api/workouts/weekly-stats` | Weekly aggregated stats |

### Nutrition
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/nutrition` | List nutrition logs |
| POST | `/api/nutrition` | Log a meal |
| PUT | `/api/nutrition/:id` | Update meal log |
| DELETE | `/api/nutrition/:id` | Delete meal log |
| GET | `/api/nutrition/daily-summary` | Today's totals |
| GET | `/api/nutrition/weekly-stats` | Weekly breakdown |

### Progress
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/progress/dashboard` | Dashboard summary |
| GET | `/api/progress/monthly` | Monthly chart data |
| GET | `/api/progress/insights` | AI-style weekly insights |

### Goals
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/goals` | List goals |
| POST | `/api/goals` | Create goal |
| PUT | `/api/goals/:id` | Update goal |
| PATCH | `/api/goals/:id/progress` | Update current value |
| DELETE | `/api/goals/:id` | Delete goal |

---

## Bugs Fixed (vs Original Upload)

1. **Duplicate service registrations** – `GoalService`, `NutritionService`, `ProgressService` were defined twice (once in individual `.js` files, again in `api.services.js`). Fixed by clearing `api.services.js`.

2. **HTTP interceptor registered twice** – `app.config(['$httpProvider'...])` appeared both in `http.interceptor.js` and was expected in `app.config.js`. Removed from interceptor file, registered once in `app.config.js`.

3. **Wrong script load order** – `app.config.js` was loaded before services, so `AuthInterceptor` factory wasn't registered when `$httpProvider.interceptors.push()` ran. Fixed: services load first, then config.

4. **AngularJS 1.6+ hashPrefix mismatch** – Default `hashPrefix` changed to `'!'` in AngularJS 1.6+, making all `#/` links resolve to `#!/`. Fixed: added `$locationProvider.hashPrefix('!')` and updated all `href="#/..."` to `href="#!/..."` across all views.

5. **CORS locked to port 4200** – Backend only allowed `localhost:4200` (Angular CLI default). AngularJS 1.x is static HTML — no CLI port. Fixed: CORS now allows any `localhost` port in development.

6. **Frontend not served by Express** – No static file serving for the frontend. Fixed: `server.js` now serves `../frontend` as static files and falls back to `index.html` for SPA routing.

7. **No `.env` file** – Only `.env.example` was provided; app crashed on startup without `JWT_SECRET`. Fixed: created `backend/.env` with working defaults.

8. **Progress chart data mapping bug** – Frontend tried `d._id.split('-')[2]` on nutrition chart data, but the backend returns `_id` as an integer (day-of-month from MongoDB's `$dayOfMonth`). Fixed: use `String(d._id)` directly.

9. **`logs/` directory missing** – Winston logger tries to write to `logs/error.log` but the directory didn't exist, causing a startup error. Fixed: created `backend/logs/`.
