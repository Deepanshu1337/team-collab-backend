# 🚀 Real-Time Team Collaboration Backend

A production-grade backend for a real-time team collaboration platform built with Node.js, Express, MongoDB, Socket.IO, and an AI-powered assistant.
The system supports role-based access control, Kanban-style task management, realtime chat, and a natural language assistant.

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- Firebase Authentication (Admin SDK)
- Role-based access control:
  - ADMIN
  - MANAGER
  - MEMBER
- Team-scoped authorization (data isolation per team)

---

### 🧑‍🤝‍🧑 Team & Project Management
- Team creation with automatic ADMIN assignment
- Project CRUD with role enforcement
- Secure team-based data access

---

### 📋 Task Management (Kanban)
- Task CRUD with assignments
- Status-based workflow: `todo → in-progress → done`
- Position-based ordering for drag & drop Kanban boards
- Realtime task sync across all team members

---

### 💬 Realtime Team Chat
- Persistent chat messages stored in MongoDB
- Realtime updates via Socket.IO
- Team-scoped messaging

---

### 🤖 AI Assistant (Gemini – Free Tier)
- Natural language commands like:
  - "Move task Fix login bug to done"
  - "Assign API task to Rahul"
- AI used only for intent extraction
- Role-aware execution (cannot bypass permissions)
- Full audit logging of assistant actions
- Regex-based fallback if AI is unavailable

---

### 📡 Realtime Architecture
- REST APIs as the single source of truth
- Socket.IO used only for broadcasting updates
- Team-based socket rooms
- Safe, scalable realtime design

---

### 🛡️ Production Hardening
- Joi request validation
- Centralized error handling
- Rate limiting
- Security headers (Helmet)
- Structured logging (Pino)
- Graceful shutdown for deployments

---

## 🛠 Tech Stack

**Backend**
- Node.js
- Express.js
- MongoDB + Mongoose

**Authentication**
- Firebase Admin SDK

**Realtime**
- Socket.IO

**AI / NLP**
- Google Gemini (free tier)

**Security & Reliability**
- Joi
- Helmet
- express-rate-limit
- Pino logger

---

## 📂 Project Structure

```
src/
├── app.js
├── server.js
├── config/
│   ├── db.js
│   ├── env.js
│   ├── firebase.js
│   └── logger.js
├── assistant/
│   ├── assistant.controller.js
│   ├── assistant.service.js
│   ├── assistant.parser.js
│   └── assistant.prompts.js
├── socket/
│   ├── index.js
│   └── chat.sockets.js
├── controller/
├── routes/
├── models/
├── middleware/
├── validators/
└── utils/
```

---

## 🔐 Roles & Permissions

| Action           | MEMBER | MANAGER | ADMIN |
|------------------|:------:|:-------:|:-----:|
| View projects    |   ✅    |    ✅    |   ✅   |
| Create project   |   ❌    |    ✅    |   ✅   |
| Delete project   |   ❌    |    ❌    |   ✅   |
| Create task      |   ❌    |    ✅    |   ✅   |
| Assign task      |   ❌    |    ✅    |   ✅   |
| Use assistant    | Limited|    ✅    |   ✅   |

---

## ⚙️ Environment Setup

### 1️⃣ Create `.env`
```bash
cp .env.example .env
```

Add the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<db_name>

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# AI Assistant
GEMINI_API_KEY=

# Rate Limiting
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=100
```

### 🔐 Firebase Admin Setup
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key
3. Save it as `firebase-service-account.json`
4. Place it in the project root
5. Ensure it is listed in `.gitignore`

### ▶️ Run Locally
```bash
npm install
npm run dev
```
Server will run at: http://localhost:5000

---

## 📡 Realtime Events

### Task Events
- task:created
- task:updated
- task:moved
- task:deleted

### Chat Events
- chat:new-message

---

## 🤖 AI Assistant

### Endpoint
```
POST /api/assistant
```

### Example Request
```json
{
  "command": "Move task Fix login bug to done"
}
```

### Safety Design
- AI only extracts intent
- All actions pass through role checks
- All assistant actions are audit logged
- Regex fallback if AI fails

---

## 🌍 Deployment
- Backend: Render / Railway
- Database: MongoDB Atlas
- AI: Gemini (free tier)

Ensure all environment variables are configured on the deployment platform.

---

## 🎯 Design Principles
- REST APIs are the source of truth
- Realtime is used only for synchronization
- Defense-in-depth security
- Clean, modular, scalable architecture
- Provider-agnostic AI integration

---

## 📌 Notes
This project demonstrates:
- Backend architecture skills
- Realtime system design
- Secure role-based access control
- Responsible AI integration
- Production-ready engineering practices

---

## 👨‍💻 Author
Built as a full-stack engineering assignment and learning project.
