# TManager — Premium Team Task Manager SaaS

TManager is a modern, high-performance Full-Stack Team Task Manager designed with a premium, minimal, earthy aesthetic. It features a complete dashboard, drag-and-drop Kanban boards, team management, analytics, and role-based access control.

The project is separated into a **Vanilla JS/HTML/CSS Frontend** and a **Node.js/Express Backend**, perfectly optimized for deployment on Netlify and Railway.

---

## 🌟 Key Features

### Frontend (UI/UX)
- **Premium Design System:** Beautiful earthy color palette inspired by modern SaaS platforms.
- **Glassmorphism & Animations:** Smooth transitions, floating cards, and animated interactive elements.
- **Dark/Light Mode:** Seamless theme toggling with session persistence.
- **Interactive Kanban Board:** Full HTML5 drag-and-drop task management.
- **Analytics Dashboard:** Visualizations powered by Chart.js.
- **Responsive Layout:** Fluid design with a mobile-friendly sliding sidebar.

### Backend (API & Logic)
- **RESTful API:** Robust endpoints for Projects, Tasks, Users, and Auth.
- **Authentication:** Secure JWT-based login and registration.
- **Role-Based Access Control (RBAC):** `Admin` and `Member` privileges protecting sensitive routes.
- **MongoDB Integration:** Complex Mongoose schemas with data validation and virtuals.
- **Security:** Password hashing with `bcryptjs`, protected routes, and custom CORS handling.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla), Chart.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **Deployment:** Netlify (Frontend) & Railway (Backend)

---

## 📁 Project Structure

```text
TManager/
├── frontend/                 # Client-side Application
│   ├── index.html            # Main application shell & login screen
│   ├── styles.css            # Complete design system & responsive styling
│   ├── app.js                # Core logic, routing, and UI state management
│   ├── data.js               # Mock data (to be replaced by API calls)
│   ├── netlify.toml          # Netlify configuration
│   └── _redirects            # SPA routing rules
│
└── backend/                  # Server-side API
    ├── config/               # Database connection logic
    ├── middleware/           # Auth and Role verification
    ├── models/               # Mongoose Schemas (User, Project, Task)
    ├── routes/               # Express API routes
    ├── server.js             # Main application entry point
    ├── railway.json          # Railway configuration
    └── Procfile              # Process file for hosting
```

---

## ⚙️ Environment Variables

To run the backend locally, create a `.env` file in the `backend/` directory based on the provided `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tmanager
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

*(Note: In production, `FRONTEND_URL` should be your Netlify URL, and `MONGODB_URI` should be your MongoDB Atlas connection string).*

---

## 🚀 Local Development

### 1. Start the Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server (uses nodemon):
   ```bash
   npm run dev
   ```
   *The server will run on http://localhost:5000*

### 2. Start the Frontend
Since the frontend uses Vanilla JS/HTML/CSS without a bundler, you can run it using any simple local server. For example, using VS Code's **Live Server** extension, or Python:
```bash
cd frontend
npx serve . 
# OR
python -m http.server 3000
```
*The app will run on http://localhost:3000*

---

## 🌐 Deployment Guide

### Deploying the Frontend (Netlify)
1. Go to [Netlify](https://www.netlify.com/).
2. Drag and drop the `frontend/` folder, OR link your GitHub repo and set the publish directory to `frontend/`.
3. Netlify will automatically use the `netlify.toml` and `_redirects` files to configure caching and SPA routing.

### Deploying the Backend (Railway)
1. Go to [Railway](https://railway.app/).
2. Create a new project and connect your GitHub repository, pointing it to the `backend/` folder.
3. Railway will detect `package.json` and `railway.json` to build and deploy the Node.js server.
4. **Important:** Add your Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`) in the Railway dashboard under the "Variables" tab.

---

## 🔌 API Endpoints Summary

### Auth (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Authenticate user & get token
- `GET /me` - Get current logged-in user (Private)

### Projects (`/api/projects`)
- `GET /` - Get all projects (Private)
- `POST /` - Create a project (Admin)
- `PUT /:id` - Update a project (Admin)
- `DELETE /:id` - Delete a project (Admin)

### Tasks (`/api/tasks`)
- `GET /` - Get tasks based on role (Private)
- `GET /stats` - Get dashboard statistics (Private)
- `POST /` - Create a task (Admin)
- `PUT /:id` - Update a task (Members can only update status)
- `DELETE /:id` - Delete a task (Admin)

### Team (`/api/team`)
- `GET /` - Get all team members (Private)
- `PUT /:id` - Update user details (Self/Admin)
- `DELETE /:id` - Remove user (Admin)
