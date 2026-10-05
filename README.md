# TaskFlow - Real-Time Enterprise Task Management System

A full-stack task management platform built with the **MERN stack**. It includes JWT authentication, role-based access control (RBAC), task assignment between users, live updates with **Socket.io**, deadline tracking, and an analytics dashboard.

## Live Demo

| Service | Link |
|---|---|
| Frontend (Vercel) | [task-flow-five-orpin.vercel.app](https://task-flow-five-orpin.vercel.app) |
| Backend API (Render) | [taskflow-api-z9rw.onrender.com](https://taskflow-api-z9rw.onrender.com) |
| Source Code | [github.com/priyanshuydv12/TaskFlow](https://github.com/priyanshuydv12/TaskFlow) |

> **Note:** The backend runs on a free Render instance. If it has been idle, the **first request can take 50+ seconds** while the server wakes up. Please wait and retry.

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| User | `demo.user@taskflow.com` | `Demo@12345` |
| Admin | `demo.admin@taskflow.com` | `Demo@12345` |

You can also register your own account. New accounts always get the `user` role.

---

## Features

- **Authentication:** register, login and logout with JWT. Passwords are hashed with bcrypt.
- **Role-Based Access Control:** `user` and `admin` roles, enforced by middleware on the server.
- **Task Management:** create, view, update, delete and change the status of tasks. Each task has a title, description, priority, status and deadline.
- **Task Assignment:** any logged-in user can assign a task to any other user from the Create Task form.
- **Real-Time Updates:** Socket.io pushes task events (`task:created`, `task:updated`, deletions) and notifications to connected clients instantly.
- **Notifications:** assignees get an in-app notification (bell icon) when a task is assigned to them.
- **Deadline Tracking:** a background job checks task deadlines and flags overdue tasks.
- **Analytics Dashboard:** completion rate, total / to-do / in-progress / overdue counters, task creation trend over 7 days, and a status distribution chart.
- **Admin Panel:** admins can manage all users and all tasks.
- **Profile Page:** view and update your own profile.
- **Secure CORS:** REST API and Socket.io only accept requests from the configured `CLIENT_URL`.
- **Postman Collection** included for quick API testing.

### Access Rules

| Action | Who can do it |
|---|---|
| View a task | Admin, the task creator, or the assignee |
| Update or delete a task | Admin or the task creator |
| Change task status | Authorized users per the task rules |
| Fetch the assignable users list | Any logged-in user |
| Manage users (list, edit, delete) | Admin only |

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS, Axios, Socket.io Client, Lucide Icons |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB Atlas, Mongoose |
| Auth | JSON Web Tokens (JWT), bcryptjs |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

---

## Project Structure

```
TaskFlow/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── api/                # Axios instance and interceptors
│   │   ├── components/         # Layout, Navbar, Sidebar, NotificationBell
│   │   ├── context/            # Auth and Toast context
│   │   ├── pages/              # Login, Register, Dashboard, Tasks, CreateTask,
│   │   │                       # TaskDetail, Profile, AdminTasks, AdminUsers
│   │   └── routes/             # Route guards
│   └── .env.example
├── server/                     # Express backend
│   ├── config/                 # Database connection
│   ├── controllers/            # Auth, task, user, notification handlers
│   ├── middleware/             # Auth (protect) and role checks
│   ├── models/                 # User, Task, Notification schemas
│   ├── routes/                 # API routes
│   ├── sockets/                # Socket.io events
│   ├── utils/                  # Token helper, deadline checker, admin seeder
│   ├── app.js
│   ├── server.js
│   └── .env.example
├── MERN_Task_Management_API.postman_collection.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v20 or higher
- MongoDB Community Server running locally on port `27017`, **or** a MongoDB Atlas connection string
- Git

### 1. Clone the repository

```bash
git clone https://github.com/priyanshuydv12/TaskFlow.git
cd TaskFlow
```

### 2. Configure and start the backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/task_management
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
ADMIN_PASSWORD=choose_a_strong_admin_password
```

Create the first admin account (optional):

```bash
node utils/seedAdmin.js
```

This creates `admin@example.com` using the password from `ADMIN_PASSWORD`. Change it after your first login.

Start the server:

```bash
npm run dev
```

The API runs on `http://localhost:5001`.

### 3. Configure and start the frontend

Open a new terminal:

```bash
cd client
npm install
cp .env.example .env
```

Set the API URL in `client/.env` (note the `/api` at the end):

```env
VITE_API_URL=http://localhost:5001/api
```

Start the app:

```bash
npm run dev
```

The app runs on `http://localhost:5173`.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (Render sets this automatically) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `JWT_EXPIRE` | Token lifetime, for example `30d` |
| `CLIENT_URL` | Allowed frontend origin(s) for CORS. Comma-separate multiple. No trailing slash |
| `ADMIN_PASSWORD` | Password used by the admin seeder script |

### Client (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL, including `/api` |

---

## API Documentation

All routes accept and return JSON in this shape:

```json
{ "success": true, "message": "string", "data": {} }
```

Protected routes need the header `Authorization: Bearer <token>`.

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user. Role is forced to `user` |
| POST | `/api/auth/login` | Public | Login and receive a JWT |
| GET | `/api/auth/me` | Private | Get the logged-in user's profile |
| POST | `/api/auth/logout` | Private | Clear the session |

**Sample login request:**

```json
{
  "email": "demo.user@taskflow.com",
  "password": "Demo@12345"
}
```

### Tasks

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/tasks` | Private | List tasks (admins see all; others see tasks they created or are assigned). Supports `status`, `priority`, `assignedTo`, `createdBy` filters |
| POST | `/api/tasks` | Private | Create a task, optionally with `assignedTo` |
| GET | `/api/tasks/:id` | Admin / creator / assignee | Get one task |
| PUT | `/api/tasks/:id` | Admin / creator | Update a task |
| DELETE | `/api/tasks/:id` | Admin / creator | Delete a task |
| PATCH | `/api/tasks/:id/status` | Private | Update task status |
| PATCH | `/api/tasks/:id/assign` | Private | Assign a task to a user |

**Sample create task request:**

```json
{
  "title": "Prepare weekly report",
  "description": "Collect metrics and draft the summary.",
  "priority": "high",
  "status": "todo",
  "deadline": "2026-10-20",
  "assignedTo": "<userId>"
}
```

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users/list` | Private | Name, email and avatar of all users (for the assignee dropdown) |
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/:id` | Admin | Get a user |
| PUT | `/api/users/:id` | Admin | Update a user |
| DELETE | `/api/users/:id` | Admin | Delete a user |

The full list of routes (including notifications) with request examples is in the included Postman collection.

---

## Security

- Passwords are hashed with bcrypt and never returned by the API.
- Registration never accepts a `role` from the request body.
- Role and ownership checks run on the server for every protected route.
- The assignable users list only exposes `name`, `email` and `avatar`.
- CORS for REST and Socket.io is restricted to `CLIENT_URL`.
- Secrets live in environment variables. `.env` files are git-ignored.

---

## Deployment

| Service | Settings |
|---|---|
| **MongoDB Atlas** | Create a free cluster, add a database user, and allow network access (`0.0.0.0/0` for Render) |
| **Render** (backend) | Root directory `server`, build command `npm install`, start command `node server.js`. Add `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `CLIENT_URL` |
| **Vercel** (frontend) | Root directory `client`. Add `VITE_API_URL=https://<your-render-url>/api`, then redeploy |

---

## Testing the API

Import `MERN_Task_Management_API.postman_collection.json` into Postman, set the base URL to `http://localhost:5001`, and run the requests in order: register, login, then the task routes.

---

## Author

**Priyanshu Yadav**
B.Tech CSE, GLA University, Mathura
GitHub: [@priyanshuydv12](https://github.com/priyanshuydv12)
