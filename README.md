# ⚡ FitTrack Pro – Smart Fitness & Nutrition Tracker

> A production-grade MEAN stack web application for tracking workouts, nutrition, goals, and progress with gamification, analytics, and a premium dark UI.

![FitTrack Pro Banner](https://via.placeholder.com/1200x400/0F172A/22C55E?text=FitTrack+Pro)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Angular Architecture](#angular-architecture)
7. [UI Design System](#ui-design-system)
8. [Features](#features)
9. [Setup Guide](#setup-guide)
10. [Environment Variables](#environment-variables)
11. [Scripts](#scripts)
12. [Deployment](#deployment)

---

## 🎯 Project Overview

FitTrack Pro is a full-stack fitness tracking application that allows users to:

- 🏋️ **Track Workouts** – Log exercises with sets, reps, weight, duration, calories burned
- 🥗 **Track Nutrition** – Log meals with detailed macro breakdown (protein, carbs, fat, fiber, water)
- 📊 **Dashboard Analytics** – Real-time summary of daily/weekly stats with visual charts
- 🎯 **Goal Tracking** – Set daily/weekly/monthly goals with progress rings
- 📈 **Progress Visualization** – SVG bar/line charts for monthly activity
- 🔥 **Gamification** – Streak system, achievement badges, and points
- 💡 **Weekly Insights** – AI-like smart suggestions based on user data

---

## 🛠 Tech Stack

| Layer       | Technology              | Version    |
|-------------|-------------------------|------------|
| Frontend    | Angular (Standalone)    | 17.x       |
| State       | Angular Signals         | Built-in   |
| HTTP        | HttpClient + Interceptors| Built-in  |
| Forms       | Reactive Forms          | Built-in   |
| Backend     | Node.js + Express.js    | 18.x / 4.x |
| Database    | MongoDB + Mongoose      | 7.x / 8.x  |
| Auth        | JWT (jsonwebtoken)      | 9.x        |
| Password    | bcryptjs                | 2.x        |
| Validation  | express-validator       | 7.x        |
| Logging     | Winston + Morgan        | 3.x        |
| Security    | Helmet + cors + rate-limit | Latest  |

---

## 📁 Folder Structure

```
fittrack-pro/
├── backend/                        # Node.js + Express API
│   ├── server.js                   # Entry point
│   ├── .env.example                # Environment template
│   ├── package.json
│   ├── config/                     # DB config (if separated)
│   ├── controllers/
│   │   ├── auth.controller.js      # Register, login, profile
│   │   ├── workout.controller.js   # CRUD + weekly stats
│   │   ├── nutrition.controller.js # CRUD + daily/weekly summary
│   │   ├── progress.controller.js  # Dashboard, monthly, insights
│   │   └── goal.controller.js      # Goal CRUD + progress update
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT protect + generateToken
│   │   └── errorHandler.js        # Global error handler
│   ├── models/
│   │   ├── user.model.js           # User + streak + achievements
│   │   ├── workout.model.js        # Workout + exercises sub-schema
│   │   ├── nutrition.model.js      # NutritionLog + food items
│   │   └── goal.model.js           # Goal with virtual progress
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── workout.routes.js
│   │   ├── nutrition.routes.js
│   │   ├── progress.routes.js
│   │   └── goal.routes.js
│   └── utils/
│       └── logger.js               # Winston logger
│
└── frontend/                       # Angular 17 SPA
    ├── angular.json
    ├── proxy.conf.json             # Dev proxy to backend
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── main.ts                 # Bootstrap
        ├── index.html
        ├── styles.css              # Global design system
        ├── environments/
        │   ├── environment.ts
        │   └── environment.prod.ts
        └── app/
            ├── app.component.ts    # Root component
            ├── app.config.ts       # App providers
            ├── app.routes.ts       # Lazy-loaded routes
            ├── core/
            │   ├── guards/
            │   │   ├── auth.guard.ts
            │   │   └── guest.guard.ts
            │   ├── interceptors/
            │   │   └── auth.interceptor.ts
            │   └── services/
            │       ├── auth.service.ts
            │       ├── workout.service.ts
            │       ├── nutrition.service.ts
            │       ├── progress.service.ts
            │       └── goal.service.ts
            ├── pipes/
            │   └── custom.pipes.ts # calories, duration, relativeDate, macroPercent
            └── modules/
                ├── auth/
                │   ├── auth.routes.ts
                │   ├── login/login.component.ts
                │   └── register/register.component.ts
                ├── shared/
                │   └── layout/layout.component.ts  # Sidebar + topbar
                ├── dashboard/
                │   └── dashboard.component.ts
                ├── workout/
                │   └── workout.component.ts
                ├── nutrition/
                │   └── nutrition.component.ts
                ├── progress/
                │   └── progress.component.ts
                └── settings/
                    └── settings.component.ts
```

---

## 🗄 Database Schema

### User
```js
{
  name: String,          // required, 2-50 chars
  email: String,         // unique, required
  password: String,      // bcrypt hashed, select: false
  avatar: String,
  profile: {
    age, weight, height, gender,
    activityLevel: enum['sedentary','light','moderate','active','very_active'],
    fitnessGoal: enum['lose_weight','maintain','gain_muscle','improve_endurance']
  },
  streak: { current, longest, lastActivity },
  achievements: [{ id, name, description, icon, earnedAt }],
  totalPoints: Number,
  isActive: Boolean
  // virtual: bmi
}
```

### Workout
```js
{
  user: ObjectId(ref: User),
  title: String,
  type: enum['strength','cardio','hiit','flexibility','mixed','sports'],
  exercises: [{
    name, category, sets, reps, weight, duration, distance, caloriesBurned, notes
  }],
  date: Date,
  duration: Number,         // total minutes
  totalCaloriesBurned: Number, // auto-calculated
  intensity: enum['low','moderate','high','extreme'],
  mood: enum['terrible','bad','okay','good','great'],
  notes: String,
  isCompleted: Boolean
}
```

### NutritionLog
```js
{
  user: ObjectId(ref: User),
  date: Date,
  mealType: enum['breakfast','lunch','dinner','snack','pre_workout','post_workout'],
  foods: [{
    name, quantity, unit, calories, protein, carbs, fat, fiber, sugar
  }],
  totalCalories, totalProtein, totalCarbs, totalFat, totalFiber, // auto-calculated
  water: Number,   // ml
  notes: String
  // virtual: macroRatio
}
```

### Goal
```js
{
  user: ObjectId(ref: User),
  type: enum['calories_in','calories_burned','protein','water','workout_days','weight',...],
  title: String,
  targetValue: Number,
  currentValue: Number,
  unit: String,           // kcal, g, ml, days, kg
  period: enum['daily','weekly','monthly','one_time'],
  startDate, endDate,
  isActive, isCompleted, completedAt
  // virtual: progressPercent, daysRemaining
}
```

---

## 🔌 API Endpoints

### Auth  `POST /api/auth`
| Method | Endpoint                | Auth | Description           |
|--------|-------------------------|------|-----------------------|
| POST   | `/api/auth/register`    | ❌   | Register new user     |
| POST   | `/api/auth/login`       | ❌   | Login + get JWT       |
| GET    | `/api/auth/me`          | ✅   | Get current user      |
| PUT    | `/api/auth/profile`     | ✅   | Update profile        |
| PUT    | `/api/auth/change-password` | ✅ | Change password     |

**Register Request:**
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "secret123",
  "profile": { "fitnessGoal": "gain_muscle", "activityLevel": "active" }
}
```
**Login Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "_id": "...", "name": "Alex Johnson", "email": "alex@example.com", "streak": {...} }
}
```

---

### Workouts  `GET/POST/PUT/DELETE /api/workouts`
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | `/api/workouts`                 | List (paginated, filtered)|
| GET    | `/api/workouts/weekly-stats`    | Weekly aggregation        |
| GET    | `/api/workouts/:id`             | Single workout            |
| POST   | `/api/workouts`                 | Create workout            |
| PUT    | `/api/workouts/:id`             | Update workout            |
| DELETE | `/api/workouts/:id`             | Delete workout            |

**Query Params:** `page`, `limit`, `type`, `startDate`, `endDate`, `sort`

**Create Workout Body:**
```json
{
  "title": "Push Day A",
  "type": "strength",
  "date": "2025-03-20",
  "duration": 60,
  "intensity": "high",
  "mood": "great",
  "exercises": [
    { "name": "Bench Press", "category": "strength", "sets": 4, "reps": 8, "weight": 80, "caloriesBurned": 80 },
    { "name": "Overhead Press", "category": "strength", "sets": 3, "reps": 10, "weight": 50, "caloriesBurned": 60 }
  ]
}
```

---

### Nutrition  `GET/POST/PUT/DELETE /api/nutrition`
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| GET    | `/api/nutrition`                  | List logs (filtered)     |
| GET    | `/api/nutrition/daily-summary`    | Daily macro totals        |
| GET    | `/api/nutrition/weekly-stats`     | 7-day nutrition chart     |
| GET    | `/api/nutrition/:id`              | Single log               |
| POST   | `/api/nutrition`                  | Create log               |
| PUT    | `/api/nutrition/:id`              | Update log               |
| DELETE | `/api/nutrition/:id`              | Delete log               |

---

### Progress  `GET /api/progress`
| Method | Endpoint                    | Description                    |
|--------|-----------------------------|--------------------------------|
| GET    | `/api/progress/dashboard`   | Today + week summary           |
| GET    | `/api/progress/monthly`     | Monthly workout + nutrition    |
| GET    | `/api/progress/insights`    | AI-like weekly suggestions     |

---

### Goals  `GET/POST/PUT/PATCH/DELETE /api/goals`
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | `/api/goals`                    | List goals (filtered)    |
| POST   | `/api/goals`                    | Create goal              |
| PUT    | `/api/goals/:id`                | Update goal              |
| PATCH  | `/api/goals/:id/progress`       | Update current value     |
| DELETE | `/api/goals/:id`                | Delete goal              |

---

## 🅰 Angular Architecture

### Standalone Components (Angular 17)
All components are standalone with direct imports — no NgModules needed.

### Signals (Reactive State)
```ts
// Services use signals for reactive state
currentUser = signal<User | null>(null);
isAuthenticated = computed(() => !!this.currentUser());

// Components read signals
user = this.auth.currentUser; // reactive reference
```

### Lazy-Loaded Routes
```ts
// All page modules are lazy-loaded
{
  path: 'dashboard',
  loadComponent: () => import('./modules/dashboard/dashboard.component')
    .then(m => m.DashboardComponent)
}
```

### HTTP Interceptor (JWT)
```ts
// Automatically attaches Bearer token to every API request
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  const authReq = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;
  return next(authReq);
};
```

### Custom Pipes
| Pipe           | Usage                             |
|----------------|-----------------------------------|
| `calories`     | `2000 \| calories` → `2,000 kcal` |
| `duration`     | `90 \| duration` → `1h 30m`       |
| `relativeDate` | Date → `Today`, `Yesterday`, `3 days ago` |
| `macroPercent` | Grams + macro type → percentage   |

---

## 🎨 UI Design System

### Color Palette
| Variable          | Value     | Usage                |
|-------------------|-----------|----------------------|
| `--bg-primary`    | `#0F172A` | Page background      |
| `--bg-secondary`  | `#1E293B` | Sidebar, topbar      |
| `--bg-card`       | `#1E293B` | Cards, inputs        |
| `--bg-hover`      | `#293548` | Hover states         |
| `--border`        | `#334155` | All borders          |
| `--accent-green`  | `#22C55E` | Primary CTA, active  |
| `--accent-blue`   | `#38BDF8` | Secondary accent     |
| `--text-primary`  | `#F1F5F9` | Main text            |
| `--text-secondary`| `#94A3B8` | Labels, meta         |
| `--text-muted`    | `#64748B` | Placeholders         |

### Typography
- Font: **Inter** (Google Fonts)
- Weights used: 400, 500, 600, 700, 800

### Layout
- Grid-based dashboard (CSS Grid)
- Sidebar: 240px (collapsible to 68px)
- Topbar: 64px sticky header
- Border radius: 8px (inputs), 12px (cards), 14px (large cards), 20px (modals)
- Transitions: `0.2s ease` on all interactive elements

---

## ✨ Features

### Core
- ✅ JWT Authentication (register / login / logout)
- ✅ Workout CRUD with exercise sub-items
- ✅ Nutrition CRUD with per-food macro tracking
- ✅ Goal setting and progress tracking
- ✅ Dashboard with real-time stats
- ✅ Monthly activity charts (SVG bar + line)
- ✅ Responsive layout (mobile-friendly)
- ✅ Sidebar navigation with collapse
- ✅ Pagination on workout list
- ✅ Workout type filtering

### Advanced / Bonus
- ✅ Streak system (consecutive active days)
- ✅ Achievement badge system
- ✅ Points gamification
- ✅ Weekly AI-like insights (positive / warning / neutral)
- ✅ BMI calculator (virtual field)
- ✅ Progress ring visualization (SVG)
- ✅ Macro ratio bar chart
- ✅ Mood tracking on workouts
- ✅ Calorie auto-calculation from exercises

---

## 🚀 Setup Guide

### Prerequisites
- Node.js 18+ and npm 9+
- MongoDB (local or Atlas)
- Angular CLI 17+

### 1. Clone / Download
```bash
# If using Git:
git clone https://github.com/yourname/fittrack-pro.git
cd fittrack-pro

# Or extract the ZIP and enter the folder
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your settings:
# MONGO_URI=mongodb://localhost:27017/fittrack_pro
# JWT_SECRET=your_super_secret_key_here_min_32_chars

# Create logs directory
mkdir logs

# Start development server
npm run dev
# → API running on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server (proxies /api to localhost:5000)
npm start
# → App running on http://localhost:4200
```

### 4. Seed Demo Data (Optional)
```bash
cd backend
node utils/seed.js
# Creates demo@fittrack.com / demo123
```

### 5. Access the App
- Frontend: http://localhost:4200
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/health

---

## 🔧 Environment Variables

### Backend `.env`
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/fittrack_pro
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:4200
MAX_FILE_SIZE=5242880
```

### Frontend `environment.ts`
```ts
export const environment = {
  production: false,
  apiUrl: '/api'   // proxied in dev, full URL in prod
};
```

---

## 📜 Scripts

### Backend
| Command         | Description                      |
|-----------------|----------------------------------|
| `npm start`     | Start production server          |
| `npm run dev`   | Start with nodemon (auto-reload) |

### Frontend
| Command              | Description                    |
|----------------------|--------------------------------|
| `npm start`          | Dev server (port 4200)         |
| `npm run build`      | Build for production           |
| `npm run build:prod` | Production build optimized     |

---

## 🚢 Deployment

### Backend (Railway / Render / EC2)
```bash
# Set environment variables on your platform:
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/fittrack
JWT_SECRET=your_production_secret
CLIENT_URL=https://your-frontend-domain.com

npm start
```

### Frontend (Vercel / Netlify / Firebase)
```bash
# Update environment.prod.ts:
apiUrl: 'https://your-api-domain.com/api'

# Build
npm run build:prod

# Deploy dist/fittrack-pro-frontend/browser to static hosting
```

### MongoDB Atlas
1. Create free cluster at cloud.mongodb.com
2. Whitelist IPs or use `0.0.0.0/0` for all
3. Get connection string and set as `MONGO_URI`

---

## 🔐 Security Features

- JWT with 7-day expiry
- Password hashing with bcrypt (salt rounds: 12)
- Rate limiting (200 req/15min general, 20 req/15min auth)
- Helmet.js (HTTP security headers)
- CORS restricted to frontend origin
- Input validation with express-validator
- Global error handler (no stack traces in production)
- Query filtering to prevent cross-user data access

---

## 📊 Aggregation Examples

### Weekly Workout Stats
```js
Workout.aggregate([
  { $match: { user: userId, date: { $gte: weekAgo } } },
  { $group: {
    _id: { $dayOfWeek: '$date' },
    totalCalories: { $sum: '$totalCaloriesBurned' },
    totalDuration: { $sum: '$duration' },
    workoutCount: { $sum: 1 }
  }},
  { $sort: { '_id': 1 } }
])
```

### Daily Nutrition Summary
```js
NutritionLog.aggregate([
  { $match: { user: userId, date: { $gte: startOfDay, $lte: endOfDay } } },
  { $group: {
    _id: null,
    totalCalories: { $sum: '$totalCalories' },
    totalProtein:  { $sum: '$totalProtein' },
    totalCarbs:    { $sum: '$totalCarbs' },
    totalFat:      { $sum: '$totalFat' }
  }}
])
```

---

## 🎮 Gamification System

### Streaks
- Each time a workout is logged → `user.updateStreak()` is called
- If `lastActivity` was yesterday → streak increments
- If more than 1 day gap → streak resets to 1
- `streak.longest` is always preserved

### Points
- Log a workout → +10 points
- Points accumulate in `user.totalPoints`

### Achievements
Stored in `user.achievements[]` array. Can be awarded server-side when milestones are hit (e.g., first workout, 7-day streak, 100 workouts).

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open Pull Request

---

## 📄 License

MIT License – free to use and modify.

---

**Built with ❤️ using the MEAN Stack**
*Angular 17 · Node.js · Express · MongoDB*
