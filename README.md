# Momentum Ledger ✨

[![GitHub](https://img.shields.io/badge/GitHub-Saraahameed/Momentum--Ledger-blue)](https://github.com/Saraahameed/Momentum-Ledger)

A beautifully designed productivity application with a charming girly theme for managing tasks and projects. Built with React and Node.js (Express), it helps users organize work, track progress, and stay focused in a clean, distraction-free environment.

## Table of Contents

- [About](#about)
- [Features](#features)
- [Demo](#demo)
- [Repository Links](#repository-links)
- [Local Development](#local-development)
- [Technologies Used](#technologies-used)
- [Planned Enhancements](#planned-enhancements)

## About

Momentum Ledger is designed to streamline task and project management with a delightful, feminine touch. Users can easily create, organize, and track tasks while maintaining focus in a pastel pink and purple themed interface.

## Features

- **Task Management**: Create, edit, and organize tasks with priorities, due dates, and notes
- **Project Organization**: Group tasks into projects with custom colors
- **Status Tracking**: Mark tasks as open or done with quick toggles
- **Filtering**: Filter tasks by status and project for focused work sessions
- **Secure Authentication**: JWT-based authentication keeps user data private
- **Girly Theme**: Adorable pastel colors, cursive fonts, and feminine design elements

## Demo

The application can be deployed for live demonstration. (Add deployed URL here if available)

## Repository Links

- **GitHub Repository**: [https://github.com/Saraahameed/Momentum-Ledger](https://github.com/Saraahameed/Momentum-Ledger)
- **Front-End Repository**: The frontend code is in the `frontend` folder of the repository
- **Back-End Repository**: The backend code is in the `backend` folder of the repository

## Local Development

1. Clone the repository from GitHub:
   ```bash
   git clone https://github.com/Saraahameed/Momentum-Ledger.git
   ```

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser at `http://localhost:5173`

### Docker Setup (Alternative)

1. Ensure Docker and Docker Compose are installed.
2. Run the application with Docker Compose:
   ```bash
   docker compose up --build -d
   ```
3. Open the application in your browser at `http://localhost:5002`

## Technologies Used

- **Frontend**: React, CSS3, Vite
- **Backend**: Node.js, Express
- **Programming Language**: JavaScript (ES6+)

## Planned Enhancements

- [ ] Dark mode toggle
- [ ] Drag and drop task reordering
- [ ] Task due date reminders and notifications
- [ ] Recurring tasks support
- [ ] Task labels and tags
- [ ] Export tasks to CSV or PDF
- [ ] Collaborative workspaces for teams
- [ ] Mobile app with offline support