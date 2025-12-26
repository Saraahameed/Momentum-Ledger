# Momentum Ledger - Backend

Express.js REST API for the Momentum Ledger productivity application.

## Frontend Repository

For full project details, screenshots, and documentation, see the frontend repository:

[momentum-ledger-frontend](https://github.com/yourusername/momentum-ledger-frontend) *(Update with your repo URL)*

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## Technologies

- Node.js
- Express.js
- MongoDB
- JWT Authentication
