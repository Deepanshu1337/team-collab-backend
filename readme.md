# TeamCollab Backend

TeamCollab is a real-time team collaboration platform that enables teams to manage projects, tasks, and communicate effectively. The backend provides a robust API for user authentication, team management, project tracking, task management, and real-time messaging.

## Features

- **User Authentication**: Secure authentication using Firebase
- **Role-based Access Control**: Admin, Manager, and Member roles with different permissions
- **Team Management**: Create, edit, and manage teams with member assignments
- **Project Management**: Organize work into projects with team assignments
- **Task Management**: Create, assign, and track tasks with drag-and-drop functionality
- **Real-time Messaging**: WebSocket-based chat system for team communication
- **Invitation System**: Invite users to teams via email
- **Dashboard Analytics**: Track team performance and task completion

## Tech Stack

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Firebase**: Authentication and real-time features
- **Socket.io**: Real-time bidirectional event-based communication
- **TypeScript**: Strong typing for better code quality

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd team-collab-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/team-collab
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_X509_CERT_URL=your-client-cert-url
   GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `GET /protected` - Verify user authentication and get user info

### Dashboard
- `GET /api/dashboard/admin` - Get admin dashboard statistics
- `GET /api/dashboard/:teamId/manager` - Get manager dashboard statistics
- `GET /api/dashboard/:teamId/member` - Get member dashboard statistics

### Teams
- `GET /api/teams` - Get all teams (for admin)
- `GET /api/teams/:teamId` - Get team by ID
- `POST /api/teams` - Create a new team
- `PUT /api/teams/:teamId` - Update a team
- `DELETE /api/teams/:teamId` - Delete a team
- `GET /api/teams/:teamId/members` - Get team members
- `POST /api/teams/:teamId/invite` - Invite user to team
- `GET /api/teams/:teamId/pending-invitations` - Get pending invitations
- `GET /api/teams/:teamId/available-users` - Get available users to invite
- `PATCH /api/teams/:teamId/members/:memberId/assign-manager` - Assign manager role
- `DELETE /api/teams/:teamId/members/:memberId` - Remove member from team
- `GET /api/teams/pending-invitations-for-user` - Get pending invitations for current user
- `GET /api/teams/project/:teamId` - Get projects for a team

### Projects
- `GET /api/projects/team` - Get projects for user's team
- `GET /api/projects/admin/all` - Get all projects for admin
- `POST /api/projects/:teamId` - Create a project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:teamId/:id` - Delete a project
- `GET /api/projects/:id` - Get project by ID
- `GET /api/projects/member` - Get projects assigned to member

### Tasks
- `GET /api/tasks/:teamId/projects/:projectId/tasks` - Get tasks for a project
- `POST /api/tasks/:teamId/projects/:projectId/tasks` - Create a task
- `PUT /api/tasks/:teamId/tasks/:taskId` - Update a task
- `DELETE /api/tasks/:teamId/tasks/:taskId` - Delete a task
- `PATCH /api/tasks/:teamId/tasks/:taskId/move` - Move task between columns
- `GET /api/tasks/assigned` - Get tasks assigned to current user
- `GET /api/tasks/:teamId/tasks` - Get all tasks for a team

### Messages
- `GET /api/messages/:teamId` - Get messages for a team
- `POST /api/messages/:teamId` - Send a message to a team

### Invitations
- `GET /api/invitations/pending` - Get pending invitations for current user
- `POST /api/invitations/accept` - Accept an invitation
- `POST /api/invitations/reject` - Reject an invitation

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Port number for the server (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `FIREBASE_*` | Firebase configuration variables (project ID, private key, etc.) |
| `GEMINI_API_KEY` | Google Gemini API key (optional) |

## Scripts

- `npm run dev` - Start the development server with auto-restart
- `npm start` - Start the production server
- `npm test` - Run tests (if available)

## Folder Structure

```
src/
├── assistant/          # AI assistant functionality (if enabled)
├── config/             # Configuration files
├── controller/         # Request handlers
├── credentials/        # Firebase service account
├── middleware/         # Custom middleware
├── models/             # Database models
├── routes/             # API routes
├── socket/             # Socket.io functionality
├── utils/              # Utility functions
├── validators/         # Request validation
├── app.js              # Express app configuration
└── server.js           # Server entry point
```

## Database Models

- **User**: Stores user information including Firebase UID, email, name, role, and team association
- **Team**: Represents a team with name, description, and members
- **Project**: Represents a project with name, description, and associated team
- **Task**: Represents a task with title, description, status, and assignment
- **Message**: Stores chat messages with sender and team information

## Middleware

- **auth.middleware.js**: Verifies Firebase tokens and attaches user context
- **teamContext.middleware.js**: Attaches team context to requests
- **requireTeamRole.middleware.js**: Ensures user has required role for team operations
- **rateLimit.middleware.js**: Implements rate limiting to prevent abuse

## Socket Events

- `chat:send` - Send a message to a team chat
- `chat:new-message` - Receive a new message in real-time
- `join-team-room` - Join a specific team's chat room
- `leave-team-room` - Leave a specific team's chat room

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.