# CollabSpace

A full-stack, real-time team collaboration platform built with the MERN stack. CollabSpace combines workspace-based team chat, channel messaging, task management, and member administration into a single SaaS-style application — similar in spirit to Slack + Trello.


## Features

### Authentication
- Email/password authentication with secure JWT stored in httpOnly cookies
- Google OAuth login via Passport.js
- Persistent sessions across refresh

### Workspaces & Channels
- Create, rename, and delete workspaces
- Invite teammates via unique invite codes
- Create, rename, and delete channels within a workspace
- Role-based access control (admin / member) with member removal

### Real-Time Messaging
- Real-time chat powered by Socket.io
- Message reactions, editing, and deletion
- Message search with scroll-to-highlight
- Read receipts using the Intersection Observer API
- Pinned messages
- File and image attachments via Cloudinary

### Task Management
- Kanban-style task board
- Task assignment with due dates
- Drag-and-drop status updates

### Notifications & Member Management
- @mention notifications
- Member list with live online/offline presence
- User profiles with avatar upload

### Responsive Design
- Fully responsive UI with a collapsible hamburger sidebar and member drawer for mobile

## Tech Stack

**Frontend**
- React + Vite
- Zustand (state management)
- Axios (with `withCredentials` for cookie-based auth)
- Socket.io Client

**Backend**
- Node.js + Express
- MongoDB Atlas (Mongoose)
- Socket.io
- Passport.js (Google OAuth 2.0)
- JWT (httpOnly cookie-based auth)
- Cloudinary (media storage)

**DevOps**
- GitHub Actions (CI pipeline for server and client)
- Render (backend deployment)
- Vercel (frontend deployment)

## Project Structure

```
CollabSpace/
├── client/             # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/      # Zustand stores
│   │   └── ...
│   └── package.json
├── server/             # Express backend
│   ├── config/         # Passport, DB config
│   ├── models/         # User, Workspace, Channel, Message, Task, Notification
│   ├── routes/
│   ├── controllers/
│   ├── sockets/
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Cloudinary account
- Google OAuth credentials

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
```

```bash
npm start
```

### Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in `client/`:

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

## Demo Accounts

| Role   | Email |
|--------|-------|
| Admin  | _add demo account here_ |
| Member | _add demo account here_ |

## CI/CD

GitHub Actions runs separate jobs for the client and server on every push — installing dependencies and running build/lint checks to catch issues before deployment.

## Author

**Laxmi B** — [GitHub](https://github.com/LaxmiB04)
