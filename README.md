# TaskFlow - Real-Time Enterprise Task Management System

A production-style task management platform built with the **MERN stack**. It has JWT authentication, role-based access control (RBAC), live updates with **Socket.io**, and a real-time analytics dashboard.

## Live Demo

| Service | Link |
|---|---|
| Frontend (Vercel) | https://task-flow-five-orpin.vercel.app |
| Backend API (Render) | https://taskflow-api-z9rw.onrender.com |
| Source Code | https://github.com/priyanshuydv12/TaskFlow |

> **Note:** The backend runs on a free Render instance. If it has been idle, the **first request can take 50+ seconds** while the server wakes up. Please wait and retry.

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| User | `demo.user@taskflow.com` | `Demo@12345` |
| Admin | `demo.admin@taskflow.com` | `Demo@12345` |

You can also register a new account from the Register page. New accounts always get the `user` role.

---

## Features

- **Authentication:** register, login and logout with JWT. Passwords are hashed with bcrypt.
- **Role-Based Access Control:** separate `user` and `admin` roles. Protected routes and admin-only actions are enforced on the server.
- **Task Management:** create, view, update and delete tasks with title, description, status and due date.
- **Task Assignment:** assign tasks to other users.
- **Real-Time Updates:** Socket.io pushes task events and notifications to connected clients instantly.
- **Deadline Tracking:** a background deadline checker marks overdue tasks and triggers notifications.
- **Analytics Dashboard:**
  - Completion rate
  - Total, To Do, In Progress and Overdue counters
  - Task creation trend over 7 days
  - Status distribution chart
- **Profile Management:** view and update your own profile.
- **Secure CORS:** the REST API and Socket.io only accept requests from the configured `CLIENT_URL`.
- **Postman Collection:** included in the repo for quick API testing.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React (Vite), React Router, Axios, Socket.io Client |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB Atlas, Mongoose |
| Auth | JSON Web Tokens (JWT), bcryptjs |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

---

## Project Structure

```
TaskFlow/
├── client/                  # React frontend
│   └── src/
├── server/                  # Express backend
│   ├── config/              # Database connection
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Auth and role checks
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── sockets/             # Socket.io events
│   ├── utils/               # Token, deadline checker, admin seeder
│   ├── app.js
│   ├── server.js
│   └── .env.example
├── MERN_Task_Management_API.postman_collection.json
└── README.md
```

---

## Installation and Setup

### Prerequisites

- Node.js v20 or higher
- MongoDB Community Server (local, port `27017`) **or** a MongoDB Atlas connection string
- Git

### 1. Clone the repository

```bash
git clone https://github.com/priyanshuydv12/TaskFlow.git
cd TaskFlow
```

### 2. Configure the backend

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

### 3. Create the first admin

```bash
node utils/seedAdmin.js
```

This creates `admin@example.com` using the password from `ADMIN_PASSWORD`. Change it after your first login.

### 4. Start the backend

```bash
npm run dev
```

Backend runs on `http://localhost:5001`.

### 5. Configure and start the frontend

Open a new terminal:

```bash
cd client
npm install
cp .env.example .env
```

Set the API URL in `client/.env`:

```env
VITE_API_URL=http://localhost:5001
```

Then run:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

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
| `CLIENT_URL` | Allowed frontend origin(s) for CORS. Comma-separated for multiple. No trailing slash |
| `ADMIN_PASSWORD` | Password used by the admin seeder |

### Client (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

---

## API Documentation

All routes accept and return JSON in this shape:

```json
{ "success": true, "message": "string", "data": {} }
```

Protected routes need either the JWT cookie or the header `Authorization: Bearer <token>`.

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user. Role is forced to `user` |
| POST | `/api/auth/login` | Public | Login and receive a JWT |
| GET | `/api/auth/me` | Private | Get the logged-in user's profile |
| POST | `/api/auth/logout` | Private | Clear the session |

**Sample login request** (`POST /api/auth/login`):

```json
{
  "email": "demo.user@taskflow.com",
  "password": "Demo@12345"
}
```

### Tasks

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/tasks` | Private | List tasks visible to the user |
| POST | `/api/tasks` | Private | Create a task (optionally with `assignedTo`) |
| PUT | `/api/tasks/:id` | Owner / Assignee / Admin | Update a task |
| DELETE | `/api/tasks/:id` | Owner / Admin | Delete a task |

> The full list of routes and request examples is in the included Postman collection.

---

## Security

- Passwords are hashed with bcrypt and never returned by the API.
- Registration never accepts a `role` from the request body.
- Admin-only routes are checked by middleware on the server.
- CORS for REST and Socket.io is restricted to `CLIENT_URL`.
- Secrets live in environment variables. `.env` is git-ignored.

---

## Deployment

| Service | Settings |
|---|---|
| **MongoDB Atlas** | Create a free cluster, add a database user, and allow network access (`0.0.0.0/0` for Render) |
| **Render** (backend) | Root directory `server`, build command `npm install`, start command `node server.js`. Add `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `CLIENT_URL` |
| **Vercel** (frontend) | Root directory `client`. Add `VITE_API_URL` pointing to the Render URL, then redeploy |

---

## Testing the API

Import `MERN_Task_Management_API.postman_collection.json` into Postman, set the base URL to `http://localhost:5001`, and run the requests in order: register, login, then the task routes.

---

## Author

**Priyanshu Yadav**
B.Tech CSE, GLA University, Mathura
GitHub: [@priyanshuydv12](https://github.com/priyanshuydv12)
